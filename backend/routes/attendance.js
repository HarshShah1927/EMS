const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, restrictTo, isAdminOrHR, canAccessEmployeeData } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Employee check-in
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
router.post('/check-in', [
  body('location').optional().isIn(['office', 'home', 'client-site', 'other']),
  body('notes').optional().trim().isLength({ max: 500 })
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

    const { location = 'office', notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if employee already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      date: new Date(),
      checkIn: new Date(),
      location,
      notes
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in'
    });
  }
});

// @desc    Employee check-out
// @route   PUT /api/attendance/check-out
// @access  Private (Employee)
router.put('/check-out', [
  body('notes').optional().trim().isLength({ max: 500 }),
  body('breakTime').optional().isInt({ min: 0, max: 480 })
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

    const { notes, breakTime = 0 } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    // Update attendance record
    attendance.checkOut = new Date();
    attendance.breakTime = breakTime;
    if (notes) {
      attendance.notes = attendance.notes ? `${attendance.notes}; ${notes}` : notes;
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-out'
    });
  }
});

// @desc    Get employee's own attendance records
// @route   GET /api/attendance/my-records
// @access  Private (Employee)
router.get('/my-records', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const attendance = await Attendance.find({
      employeeId: req.user.employeeId,
      ...dateFilter
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Attendance.countDocuments({
      employeeId: req.user.employeeId,
      ...dateFilter
    });

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance records'
    });
  }
});

// @desc    Get today's attendance status for employee
// @route   GET /api/attendance/today-status
// @access  Private (Employee)
router.get('/today-status', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      data: {
        hasCheckedIn: !!attendance,
        hasCheckedOut: !!(attendance && attendance.checkOut),
        attendance: attendance || null
      }
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today\'s status'
    });
  }
});

// @desc    Get all attendance records (Admin/HR only)
// @route   GET /api/attendance/all
// @access  Private (Admin/HR)
router.get('/all', isAdminOrHR, async (req, res) => {
  try {
    const { page = 1, limit = 50, date, employeeId, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    if (status) {
      filter.status = status;
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(filter);

    // Get attendance stats for today if no specific date filter
    let stats = null;
    if (!date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttendance = await Attendance.find({
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
      
      stats = {
        present: todayAttendance.filter(a => a.status === 'present').length,
        late: todayAttendance.filter(a => a.status === 'late').length,
        absent: totalEmployees - todayAttendance.length,
        total: totalEmployees
      };
    }

    res.json({
      success: true,
      data: {
        attendance,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance records'
    });
  }
});

// @desc    Manual attendance entry (Admin/HR only)
// @route   POST /api/attendance/manual-entry
// @access  Private (Admin/HR)
router.post('/manual-entry', isAdminOrHR, [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'half-day', 'work-from-home']),
  body('workingHours').optional().isFloat({ min: 0, max: 24 }),
  body('notes').optional().trim().isLength({ max: 500 })
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

    const {
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      workingHours,
      breakTime = 0,
      notes,
      location = 'office'
    } = req.body;

    // Verify employee exists
    const employee = await User.findOne({ employeeId, role: 'employee' });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      employeeId,
      employeeName: employee.name,
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status,
      workingHours: workingHours || 0,
      breakTime,
      notes,
      location,
      isManualEntry: true,
      approvedBy: req.user._id
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Manual attendance entry created successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Manual entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating manual attendance entry'
    });
  }
});

// @desc    Update attendance record (Admin/HR only)
// @route   PUT /api/attendance/:id
// @access  Private (Admin/HR)
router.put('/:id', isAdminOrHR, [
  param('id').isMongoId().withMessage('Invalid attendance ID'),
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('status').optional().isIn(['present', 'absent', 'late', 'half-day', 'work-from-home']),
  body('workingHours').optional().isFloat({ min: 0, max: 24 }),
  body('notes').optional().trim().isLength({ max: 500 })
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

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update fields
    const allowedUpdates = ['checkIn', 'checkOut', 'status', 'workingHours', 'breakTime', 'notes', 'location'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'checkIn' || field === 'checkOut') {
          attendance[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          attendance[field] = req.body[field];
        }
      }
    });

    attendance.approvedBy = req.user._id;
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating attendance record'
    });
  }
});

// @desc    Delete attendance record (Admin only)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
router.delete('/:id', restrictTo('admin'), [
  param('id').isMongoId().withMessage('Invalid attendance ID')
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

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting attendance record'
    });
  }
});

// @desc    Get attendance summary for employee (Admin/HR or own data)
// @route   GET /api/attendance/summary/:employeeId
// @access  Private
router.get('/summary/:employeeId', canAccessEmployeeData, [
  param('employeeId').notEmpty().withMessage('Employee ID is required')
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

    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          $gte: firstDay,
          $lte: lastDay
        }
      };
    }

    const summary = await Attendance.getAttendanceSummary(employeeId, dateFilter.date.$gte, dateFilter.date.$lte);
    
    // Get recent attendance records
    const recentAttendance = await Attendance.find({
      employeeId,
      ...dateFilter
    })
    .sort({ date: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        summary,
        recentAttendance
      }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance summary'
    });
  }
});

module.exports = router;