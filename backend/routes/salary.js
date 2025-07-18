const express = require('express');
const { body, validationResult } = require('express-validator');
const Salary = require('../models/Salary');
const { protect, isManagerOrAbove } = require('../middleware/auth');

const router = express.Router();

// Create salary record
router.post('/', protect, [
  body('employeeId').notEmpty(),
  body('amount').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const salary = new Salary(req.body);
    await salary.save();
    res.status(201).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all salary records
router.get('/', protect, async (req, res) => {
  try {
    const salaries = await Salary.find();
    res.json({ success: true, data: salaries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get salary by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update (edit) salary
router.put('/:id', protect, isManagerOrAbove, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salary) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete salary record
router.delete('/:id', protect, isManagerOrAbove, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;