const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    ref: 'Employee'
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'work-from-home'],
    default: 'present'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  breakTime: {
    type: Number,
    default: 0 // in minutes
  },
  overtime: {
    type: Number,
    default: 0 // in hours
  },
  notes: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    enum: ['office', 'home', 'client-site', 'other'],
    default: 'office'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isManualEntry: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Calculate working hours when check-out is recorded
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn);
    const checkOutTime = new Date(this.checkOut);
    const diffInMs = checkOutTime - checkInTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    // Subtract break time (convert minutes to hours)
    this.workingHours = Math.max(0, diffInHours - (this.breakTime / 60));
    
    // Calculate overtime (assuming 8 hours is standard)
    const standardHours = 8;
    this.overtime = Math.max(0, this.workingHours - standardHours);
    
    // Set status based on working hours
    if (this.workingHours >= 8) {
      this.status = 'present';
    } else if (this.workingHours >= 4) {
      this.status = 'half-day';
    } else if (this.workingHours > 0) {
      this.status = 'late';
    }
  }
  next();
});

// Method to check if employee is late
attendanceSchema.methods.isLate = function() {
  if (!this.checkIn) return false;
  
  const checkInTime = new Date(this.checkIn);
  const standardStartTime = new Date(this.date);
  standardStartTime.setHours(9, 0, 0, 0); // 9:00 AM
  
  return checkInTime > standardStartTime;
};

// Method to calculate late minutes
attendanceSchema.methods.getLateMinutes = function() {
  if (!this.isLate()) return 0;
  
  const checkInTime = new Date(this.checkIn);
  const standardStartTime = new Date(this.date);
  standardStartTime.setHours(9, 0, 0, 0); // 9:00 AM
  
  return Math.floor((checkInTime - standardStartTime) / (1000 * 60));
};

// Static method to get attendance summary for an employee
attendanceSchema.statics.getAttendanceSummary = function(employeeId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        employeeId: employeeId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertime: { $sum: '$overtime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);