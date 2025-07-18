const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const { protect, isManagerOrAbove } = require('../middleware/auth');

const router = express.Router();

// Create inventory item
router.post('/', protect, [
  body('name').notEmpty(),
  body('quantity').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all inventory items
router.get('/', protect, async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get inventory item by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update inventory item
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete inventory item
router.delete('/:id', protect, isManagerOrAbove, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;