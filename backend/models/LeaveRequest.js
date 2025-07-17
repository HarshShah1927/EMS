const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    ref: 'Employee'
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity', 'casual', 'annual'],
    required: [true, 'Leave type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  days: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: [0.5, 'Minimum leave is 0.5 days']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedByName: {
    type: String
  },
  approvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: function() {
      return this.isHalfDay;
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContact: {
    name: String,
    phone: String
  },
  handoverNotes: {
    type: String,
    trim: true
  },
  coveringEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  coveringEmployeeName: {
    type: String
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
leaveRequestSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Calculate days if not provided
  if (!this.days) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
  
  // Adjust days for half day
  if (this.isHalfDay && this.days === 1) {
    this.days = 0.5;
  }
  
  next();
});

// Method to check if leave can be cancelled
leaveRequestSchema.methods.canBeCancelled = function() {
  return this.status === 'pending' || (this.status === 'approved' && this.startDate > new Date());
};

// Method to check if leave is in the past
leaveRequestSchema.methods.isPastLeave = function() {
  return this.endDate < new Date();
};

// Method to check if leave is currently active
leaveRequestSchema.methods.isCurrentlyActive = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(this.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(this.endDate);
  endDate.setHours(23, 59, 59, 999);
  
  return this.status === 'approved' && today >= startDate && today <= endDate;
};

// Static method to get leave summary for an employee
leaveRequestSchema.statics.getLeaveSummary = function(employeeId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        employeeId: employeeId,
        status: 'approved',
        startDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$days' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to check for overlapping leaves
leaveRequestSchema.statics.checkOverlappingLeaves = function(employeeId, startDate, endDate, excludeId) {
  const query = {
    employeeId: employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      {
        startDate: {
          $lte: endDate
        },
        endDate: {
          $gte: startDate
        }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.findOne(query);
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);