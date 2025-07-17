const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required']
    }
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: [true, 'Account number is required']
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required']
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required']
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required']
    }
  },
  documents: {
    aadharNumber: {
      type: String,
      required: [true, 'Aadhar number is required']
    },
    panNumber: {
      type: String,
      required: [true, 'PAN number is required']
    }
  },
  leaveBalance: {
    annual: {
      type: Number,
      default: 21
    },
    sick: {
      type: Number,
      default: 10
    },
    casual: {
      type: Number,
      default: 12
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  terminationDate: {
    type: Date
  },
  terminationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Generate employee ID automatically
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const lastEmployee = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextId = 1;
    
    if (lastEmployee && lastEmployee.employeeId) {
      const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      nextId = lastIdNumber + 1;
    }
    
    this.employeeId = `EMP${nextId.toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for full address
employeeSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Method to calculate years of service
employeeSchema.methods.getYearsOfService = function() {
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  return Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
};

// Method to update leave balance
employeeSchema.methods.updateLeaveBalance = async function(leaveType, days) {
  if (this.leaveBalance[leaveType] >= days) {
    this.leaveBalance[leaveType] -= days;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Employee', employeeSchema);