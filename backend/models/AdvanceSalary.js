const mongoose = require('mongoose');

const advanceSalarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    ref: 'Employee'
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  amount: {
    type: Number,
    required: [true, 'Advance amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Reason for advance is required'],
    trim: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedByName: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque'],
    default: 'bank_transfer'
  },
  deductionSchedule: {
    type: String,
    enum: ['single_month', 'two_months', 'three_months', 'custom'],
    default: 'single_month'
  },
  monthlyDeduction: {
    type: Number,
    default: 0
  },
  totalDeducted: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  isFullyDeducted: {
    type: Boolean,
    default: false
  },
  deductionStartMonth: {
    type: String // Format: "YYYY-MM"
  },
  deductionEndMonth: {
    type: String // Format: "YYYY-MM"
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate monthly deduction based on schedule
advanceSalarySchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('deductionSchedule')) {
    switch (this.deductionSchedule) {
      case 'single_month':
        this.monthlyDeduction = this.amount;
        break;
      case 'two_months':
        this.monthlyDeduction = this.amount / 2;
        break;
      case 'three_months':
        this.monthlyDeduction = this.amount / 3;
        break;
      default:
        // For custom, monthlyDeduction should be set manually
        break;
    }
    this.remainingAmount = this.amount - this.totalDeducted;
  }
  next();
});

// Method to process deduction
advanceSalarySchema.methods.processDeduction = async function(deductionAmount) {
  if (deductionAmount > this.remainingAmount) {
    deductionAmount = this.remainingAmount;
  }
  
  this.totalDeducted += deductionAmount;
  this.remainingAmount = this.amount - this.totalDeducted;
  
  if (this.remainingAmount <= 0) {
    this.isFullyDeducted = true;
    this.remainingAmount = 0;
  }
  
  await this.save();
  return deductionAmount;
};

// Method to check if advance is eligible for deduction
advanceSalarySchema.methods.isEligibleForDeduction = function(currentMonth) {
  if (this.status !== 'paid' || this.isFullyDeducted) {
    return false;
  }
  
  if (!this.deductionStartMonth) {
    return false;
  }
  
  const startMonth = new Date(this.deductionStartMonth + '-01');
  const current = new Date(currentMonth + '-01');
  
  return current >= startMonth;
};

// Static method to get pending advances for an employee
advanceSalarySchema.statics.getPendingAdvances = function(employeeId) {
  return this.find({
    employeeId: employeeId,
    status: 'paid',
    isFullyDeducted: false
  }).sort({ paymentDate: 1 });
};

// Static method to get total advance amount for an employee
advanceSalarySchema.statics.getTotalAdvanceAmount = function(employeeId) {
  return this.aggregate([
    {
      $match: {
        employeeId: employeeId,
        status: 'paid',
        isFullyDeducted: false
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$remainingAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('AdvanceSalary', advanceSalarySchema);