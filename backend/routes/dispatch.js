const express = require('express');
const { body, validationResult } = require('express-validator');
const Dispatch = require('../models/Dispatch');
const { protect, isManagerOrAbove } = require('../middleware/auth');

const router = express.Router();

// Create dispatch
router.post('/', protect, [
  body('orderNumber').notEmpty(),
  body('client').notEmpty(),
  body('items').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const dispatch = new Dispatch(req.body);
    await dispatch.save();
    res.status(201).json({ success: true, data: dispatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all dispatches
router.get('/', protect, async (req, res) => {
  try {
    const dispatches = await Dispatch.find();
    res.json({ success: true, data: dispatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get dispatch by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: dispatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update dispatch
router.put('/:id', protect, async (req, res) => {
  try {
    const dispatch = await Dispatch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dispatch) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: dispatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete dispatch
router.delete('/:id', protect, isManagerOrAbove, async (req, res) => {
  try {
    const dispatch = await Dispatch.findByIdAndDelete(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Dispatch deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;