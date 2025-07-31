const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'absent'],
    default: 'checked-in'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Office'
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
