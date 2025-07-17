const express = require('express');
const { body, validationResult } = require('express-validator');
const AdvanceSalary = require('../models/AdvanceSalary');
const Employee = require('../models/Employee');
const { protect, isManagerOrAbove, canAccessEmployeeData } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all advance salary requests
// @route   GET /api/advance-salary
// @access  Private (Manager and above)
router.get('/', protect, isManagerOrAbove, async (req, res) => {
  try {
    const { status, employeeId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;

    const advances = await AdvanceSalary.find(query)
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdvanceSalary.countDocuments(query);

    res.json({
      success: true,
      data: advances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching advance salary requests'
    });
  }
});

// @desc    Get advance salary request by ID
// @route   GET /api/advance-salary/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const advance = await AdvanceSalary.findById(req.params.id)
      .populate('approvedBy', 'name email');

    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    res.json({
      success: true,
      data: advance
    });
  } catch (error) {
    console.error('Get advance salary by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching advance salary request'
    });
  }
});

// @desc    Create advance salary request
// @route   POST /api/advance-salary
// @access  Private
router.post('/', protect, [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom((value) => {
    if (value <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    return true;
  }),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('deductionSchedule').isIn(['single_month', 'two_months', 'three_months', 'custom']).withMessage('Invalid deduction schedule')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { employeeId, amount, reason, deductionSchedule, monthlyDeduction, notes } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if employee has pending advance requests
    const pendingAdvance = await AdvanceSalary.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] }
    });

    if (pendingAdvance) {
      return res.status(400).json({
        success: false,
        message: 'Employee already has a pending advance salary request'
      });
    }

    // Create advance salary request
    const advanceData = {
      employeeId,
      employeeName: employee.name,
      amount,
      reason,
      deductionSchedule,
      notes
    };

    // Set custom monthly deduction if provided
    if (deductionSchedule === 'custom' && monthlyDeduction) {
      advanceData.monthlyDeduction = monthlyDeduction;
    }

    const advance = new AdvanceSalary(advanceData);
    await advance.save();

    res.status(201).json({
      success: true,
      message: 'Advance salary request created successfully',
      data: advance
    });
  } catch (error) {
    console.error('Create advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating advance salary request'
    });
  }
});

// @desc    Update advance salary request
// @route   PUT /api/advance-salary/:id
// @access  Private
router.put('/:id', protect, [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().notEmpty().withMessage('Reason cannot be empty'),
  body('deductionSchedule').optional().isIn(['single_month', 'two_months', 'three_months', 'custom']).withMessage('Invalid deduction schedule')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const advance = await AdvanceSalary.findById(req.params.id);
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    // Only allow updates if status is pending
    if (advance.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update advance salary request that is not pending'
      });
    }

    const { amount, reason, deductionSchedule, monthlyDeduction, notes } = req.body;

    if (amount !== undefined) advance.amount = amount;
    if (reason !== undefined) advance.reason = reason;
    if (deductionSchedule !== undefined) advance.deductionSchedule = deductionSchedule;
    if (monthlyDeduction !== undefined) advance.monthlyDeduction = monthlyDeduction;
    if (notes !== undefined) advance.notes = notes;

    await advance.save();

    res.json({
      success: true,
      message: 'Advance salary request updated successfully',
      data: advance
    });
  } catch (error) {
    console.error('Update advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating advance salary request'
    });
  }
});

// @desc    Approve advance salary request
// @route   PUT /api/advance-salary/:id/approve
// @access  Private (Manager and above)
router.put('/:id/approve', protect, isManagerOrAbove, async (req, res) => {
  try {
    const advance = await AdvanceSalary.findById(req.params.id);
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    if (advance.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Advance salary request is not pending'
      });
    }

    advance.status = 'approved';
    advance.approvedBy = req.user._id;
    advance.approvedByName = req.user.name;
    advance.approvedDate = new Date();

    await advance.save();

    res.json({
      success: true,
      message: 'Advance salary request approved successfully',
      data: advance
    });
  } catch (error) {
    console.error('Approve advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving advance salary request'
    });
  }
});

// @desc    Reject advance salary request
// @route   PUT /api/advance-salary/:id/reject
// @access  Private (Manager and above)
router.put('/:id/reject', protect, isManagerOrAbove, [
  body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const advance = await AdvanceSalary.findById(req.params.id);
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    if (advance.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Advance salary request is not pending'
      });
    }

    advance.status = 'rejected';
    advance.rejectionReason = req.body.rejectionReason;
    advance.approvedBy = req.user._id;
    advance.approvedByName = req.user.name;
    advance.approvedDate = new Date();

    await advance.save();

    res.json({
      success: true,
      message: 'Advance salary request rejected successfully',
      data: advance
    });
  } catch (error) {
    console.error('Reject advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting advance salary request'
    });
  }
});

// @desc    Mark advance salary as paid
// @route   PUT /api/advance-salary/:id/pay
// @access  Private (Manager and above)
router.put('/:id/pay', protect, isManagerOrAbove, [
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'cheque']).withMessage('Invalid payment method'),
  body('deductionStartMonth').matches(/^\d{4}-\d{2}$/).withMessage('Deduction start month must be in YYYY-MM format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const advance = await AdvanceSalary.findById(req.params.id);
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    if (advance.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Advance salary request is not approved'
      });
    }

    const { paymentMethod, deductionStartMonth, notes } = req.body;

    advance.status = 'paid';
    advance.paymentDate = new Date();
    advance.paymentMethod = paymentMethod;
    advance.deductionStartMonth = deductionStartMonth;
    advance.remainingAmount = advance.amount;
    if (notes) advance.notes = notes;

    await advance.save();

    res.json({
      success: true,
      message: 'Advance salary marked as paid successfully',
      data: advance
    });
  } catch (error) {
    console.error('Mark advance salary as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking advance salary as paid'
    });
  }
});

// @desc    Get advance salary summary for an employee
// @route   GET /api/advance-salary/employee/:employeeId/summary
// @access  Private
router.get('/employee/:employeeId/summary', protect, canAccessEmployeeData, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get total advance amount
    const totalAdvanceResult = await AdvanceSalary.getTotalAdvanceAmount(employeeId);
    const totalAdvanceAmount = totalAdvanceResult.length > 0 ? totalAdvanceResult[0].totalAmount : 0;

    // Get pending advances
    const pendingAdvances = await AdvanceSalary.getPendingAdvances(employeeId);

    // Get advance history
    const advanceHistory = await AdvanceSalary.find({ employeeId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalAdvanceAmount,
        pendingAdvances,
        advanceHistory
      }
    });
  } catch (error) {
    console.error('Get advance salary summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching advance salary summary'
    });
  }
});

// @desc    Delete advance salary request
// @route   DELETE /api/advance-salary/:id
// @access  Private (Manager and above)
router.delete('/:id', protect, isManagerOrAbove, async (req, res) => {
  try {
    const advance = await AdvanceSalary.findById(req.params.id);
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance salary request not found'
      });
    }

    // Only allow deletion if status is pending or rejected
    if (!['pending', 'rejected'].includes(advance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete advance salary request that is approved or paid'
      });
    }

    await AdvanceSalary.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Advance salary request deleted successfully'
    });
  } catch (error) {
    console.error('Delete advance salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting advance salary request'
    });
  }
});

module.exports = router;