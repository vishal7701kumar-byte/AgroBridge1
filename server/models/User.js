const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: ['FARMER', 'CONSUMER', 'BULK_BUYER', 'DRIVER', 'ADMIN'],
      uppercase: true
    },

    // Farmer specific fields
    farmName: {
      type: String,
      trim: true
    },
    farmLocation: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'WARNING', 'UNDER_REVIEW', 'TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'],
      default: 'ACTIVE'
    },
    unlistedUntil: {
      type: Date,
      default: null
    },
    statusReason: {
      type: String,
      default: ''
    },
    statusUpdatedAt: {
      type: Date,
      default: null
    },
    adminNotes: {
      type: String,
      default: ''
    },

    // Consumer specific fields
    address: {
      type: String,
      trim: true
    },

    // Bulk Buyer specific fields
    businessName: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['Restaurant', 'Hotel', 'Retail Shop', 'Food Processing Company', 'Distributor', 'Other'],
      default: 'Other'
    },
    businessAddress: {
      type: String,
      trim: true
    },

    // Driver specific fields
    vehicleType: {
      type: String,
      enum: ['Bike', 'Pickup Truck', 'Mini Truck', 'Truck']
    },
    vehicleNumber: {
      type: String,
      trim: true
    },
    vehicleCapacity: {
      type: String,
      trim: true
    },
    driverStatus: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'OFFLINE'
    },

    // Common location fields
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },

    avatar: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return public profile representation without password
userSchema.methods.toProfileJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  userObj.userId = userObj._id.toString();
  return userObj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
