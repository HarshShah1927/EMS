const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    ref: 'Employee'
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: [/^(0[1-9]|1[0-2])$/, 'Month must be in MM format']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later']
  },
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
    min: [0, 'Basic salary cannot be negative']
  },
  allowances: {
    hra: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    },
    medical: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  deductions: {
    pf: {
      type: Number,
      default: 0
    },
    esi: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    advance: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  overtime: {
    hours: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  workingDays: {
    type: Number,
    required: [true, 'Working days is required'],
    min: [0, 'Working days cannot be negative'],
    max: [31, 'Working days cannot exceed 31']
  },
  presentDays: {
    type: Number,
    required: [true, 'Present days is required'],
    min: [0, 'Present days cannot be negative']
  },
  absentDays: {
    type: Number,
    default: 0
  },
  totalSalary: {
    type: Number,
    required: [true, 'Total salary is required'],
    min: [0, 'Total salary cannot be negative']
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required']
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft'
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
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque'],
    default: 'bank_transfer'
  },
  paymentReference: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  },
  advanceDeductions: [{
    advanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdvanceSalary'
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String
    }
  }],
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipPath: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for unique salary per employee per month/year
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

// Calculate totals before saving
salarySchema.pre('save', function(next) {
  // Calculate total allowances
  this.allowances.total = 
    this.allowances.hra + 
    this.allowances.transport + 
    this.allowances.medical + 
    this.allowances.bonus + 
    this.allowances.other;
  
  // Calculate total deductions
  this.deductions.total = 
    this.deductions.pf + 
    this.deductions.esi + 
    this.deductions.tax + 
    this.deductions.advance + 
    this.deductions.other;
  
  // Calculate overtime amount
  this.overtime.amount = this.overtime.hours * this.overtime.rate;
  
  // Calculate absent days
  this.absentDays = this.workingDays - this.presentDays;
  
  // Calculate total salary
  this.totalSalary = this.basicSalary + this.allowances.total + this.overtime.amount;
  
  // Calculate net salary
  this.netSalary = this.totalSalary - this.deductions.total;
  
  next();
});

// Method to add advance deduction
salarySchema.methods.addAdvanceDeduction = function(advanceId, amount, description) {
  this.advanceDeductions.push({
    advanceId: advanceId,
    amount: amount,
    description: description
  });
  
  this.deductions.advance += amount;
  this.deductions.total += amount;
  this.netSalary = this.totalSalary - this.deductions.total;
};

// Method to calculate pro-rated salary based on working days
salarySchema.methods.calculateProRatedSalary = function() {
  if (this.presentDays < this.workingDays) {
    const dailySalary = this.basicSalary / this.workingDays;
    this.basicSalary = dailySalary * this.presentDays;
  }
};

// Method to generate payslip data
salarySchema.methods.getPayslipData = function() {
  return {
    employeeId: this.employeeId,
    employeeName: this.employeeName,
    month: this.month,
    year: this.year,
    basicSalary: this.basicSalary,
    allowances: this.allowances,
    deductions: this.deductions,
    overtime: this.overtime,
    workingDays: this.workingDays,
    presentDays: this.presentDays,
    absentDays: this.absentDays,
    totalSalary: this.totalSalary,
    netSalary: this.netSalary,
    paymentMethod: this.paymentMethod,
    paidDate: this.paidDate,
    advanceDeductions: this.advanceDeductions
  };
};

// Static method to get salary summary for a period
salarySchema.statics.getSalarySummary = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalSalaryPaid: { $sum: '$netSalary' },
        totalEmployees: { $sum: 1 },
        totalAdvanceDeductions: { $sum: '$deductions.advance' },
        averageSalary: { $avg: '$netSalary' }
      }
    }
  ]);
};

// Static method to get department-wise salary summary
salarySchema.statics.getDepartmentSalarySummary = function(month, year) {
  return this.aggregate([
    {
      $match: {
        month: month,
        year: year,
        status: 'paid'
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: 'employeeId',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $group: {
        _id: '$employee.department',
        totalSalary: { $sum: '$netSalary' },
        employeeCount: { $sum: 1 },
        averageSalary: { $avg: '$netSalary' }
      }
    }
  ]);
};

module.exports = mongoose.model('Salary', salarySchema);