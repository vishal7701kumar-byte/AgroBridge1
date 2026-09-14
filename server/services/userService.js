const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isConnected, useMemoryFallback } = require('../config/db');

// In-memory user store for standalone / zero-config operation
const memoryUsers = [];

const DEMO_USERS = [
  {
    name: "Ramesh Patel",
    email: "farmer@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98261 11223",
    role: "FARMER",
    farmerId: "farmer_1",
    farmName: "Patel Organic Farms",
    farmLocation: "Berasia Road, Village Sukhi",
    district: "Bhopal",
    state: "Madhya Pradesh",
    city: "Bhopal",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Ramesh Kumar",
    email: "ramesh@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98261 11223",
    role: "FARMER",
    farmerId: "farmer_1",
    farmName: "Patel Organic Farms",
    farmLocation: "Berasia Road, Village Sukhi",
    district: "Bhopal",
    state: "Madhya Pradesh",
    city: "Bhopal",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Suresh Patel",
    email: "suresh@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98260 11990",
    role: "FARMER",
    farmerId: "farmer_suresh",
    farmName: "Patel Krishi Estate",
    farmLocation: "Sanwer Road",
    district: "Indore",
    state: "Madhya Pradesh",
    city: "Indore",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Amit Verma",
    email: "amit@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98263 44556",
    role: "FARMER",
    farmerId: "farmer_amit",
    farmName: "Verma Co-operative Fields",
    farmLocation: "Ichhawar",
    district: "Sehore",
    state: "Madhya Pradesh",
    city: "Sehore",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Anita Bai",
    email: "anita@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98265 55667",
    role: "FARMER",
    farmerId: "farmer_2",
    farmName: "Anita Bai Organic Farms",
    farmLocation: "Gulabganj",
    district: "Vidisha",
    state: "Madhya Pradesh",
    city: "Vidisha",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Mukesh Yadav",
    email: "mukesh@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98266 77889",
    role: "FARMER",
    farmerId: "farmer_3",
    farmName: "Yadav Krishi Farm",
    farmLocation: "Bhopal-Indore Bypass",
    district: "Sehore",
    state: "Madhya Pradesh",
    city: "Sehore",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Rajesh Gurjar",
    email: "rajesh@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98267 88990",
    role: "FARMER",
    farmerId: "farmer_4",
    farmName: "Narmada Valley Orchards",
    farmLocation: "Hoshangabad Road",
    district: "Hoshangabad",
    state: "Madhya Pradesh",
    city: "Narmadapuram",
    accountStatus: "ACTIVE",
    unlistedUntil: null,
    statusReason: "",
    statusUpdatedAt: null,
    adminNotes: "",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Priya Sharma",
    email: "consumer@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98262 22334",
    role: "CONSUMER",
    address: "Flat 402, Green Meadows Heights, Arera Colony",
    city: "Bhopal",
    state: "Madhya Pradesh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Arun Mehta",
    email: "bulkbuyer@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98263 33445",
    role: "BULK_BUYER",
    businessName: "Mehta Agro Wholesalers & Hotel Supplies",
    businessType: "Distributor",
    businessAddress: "Plot 12-B, Industrial Area Govindpura",
    city: "Bhopal",
    state: "Madhya Pradesh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Vikram Singh",
    email: "driver@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 98264 44556",
    role: "DRIVER",
    vehicleType: "Pickup Truck",
    vehicleNumber: "MP 04 GA 4892",
    vehicleCapacity: "1.5 Tons",
    driverStatus: "OFFLINE",
    city: "Bhopal",
    state: "Madhya Pradesh",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "System Administrator",
    email: "admin@agrobridge.demo",
    password: "Demo@123",
    phone: "+91 755 400 9000",
    role: "ADMIN",
    city: "Bhopal",
    state: "Madhya Pradesh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

// Seed Demo Users
async function seedDemoAccounts() {
  console.log('🌱 Checking / Seeding AgroBridge Demo Accounts...');
  for (const demo of DEMO_USERS) {
    if (isConnected() && !useMemoryFallback()) {
      try {
        const existing = await User.findOne({ email: demo.email.toLowerCase() });
        if (!existing) {
          await User.create(demo);
          console.log(`✅ [MongoDB] Seeded demo ${demo.role}: ${demo.email}`);
        }
      } catch (err) {
        console.error(`Error seeding ${demo.email} to MongoDB:`, err.message);
      }
    } else {
      // Memory Store
      const existing = memoryUsers.find(u => u.email.toLowerCase() === demo.email.toLowerCase());
      if (!existing) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(demo.password, salt);
        const memUser = {
          _id: `mem_${demo.role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ...demo,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
          async matchPassword(enteredPassword) {
            return bcrypt.compare(enteredPassword, this.password);
          },
          toProfileJSON() {
            const copy = { ...this };
            delete copy.password;
            copy.userId = copy._id;
            return copy;
          }
        };
        memoryUsers.push(memUser);
        console.log(`✅ [Memory] Seeded demo ${demo.role}: ${demo.email}`);
      }
    }
  }
}

// Find user by email
async function findByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (isConnected() && !useMemoryFallback()) {
    return await User.findOne({ email: cleanEmail });
  }

  return memoryUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

// Find user by business name (for bulk buyer login)
async function findByBusinessName(bName) {
  if (!bName) return null;
  const cleanName = bName.trim().toLowerCase();

  if (isConnected() && !useMemoryFallback()) {
    return await User.findOne({
      role: 'BULK_BUYER',
      businessName: { $regex: new RegExp(`^${cleanName}$`, 'i') }
    });
  }

  return memoryUsers.find(u => u.role === 'BULK_BUYER' && u.businessName && u.businessName.trim().toLowerCase() === cleanName) || null;
}

// Find user by ID
async function findById(id) {
  if (!id) return null;

  if (isConnected() && !useMemoryFallback()) {
    return await User.findById(id);
  }

  return memoryUsers.find(u => u._id.toString() === id.toString()) || null;
}

// Create new user
async function createUser(userData) {
  const cleanData = { ...userData };
  if (cleanData.email) cleanData.email = cleanData.email.trim().toLowerCase();
  if (cleanData.role) cleanData.role = cleanData.role.toUpperCase();

  if (isConnected() && !useMemoryFallback()) {
    const user = await User.create(cleanData);
    return user;
  }

  // Memory fallback
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(cleanData.password, salt);
  const memUser = {
    _id: `mem_${cleanData.role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...cleanData,
    password: hashedPassword,
    driverStatus: cleanData.role === 'DRIVER' ? 'OFFLINE' : cleanData.driverStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    async matchPassword(enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
    toProfileJSON() {
      const copy = { ...this };
      delete copy.password;
      copy.userId = copy._id;
      return copy;
    }
  };

  memoryUsers.push(memUser);
  return memUser;
}

// List all users
async function listUsers(filter = {}) {
  if (isConnected() && !useMemoryFallback()) {
    return await User.find(filter).select('-password');
  }

  return memoryUsers
    .filter(u => {
      if (filter.role && u.role !== filter.role.toUpperCase()) return false;
      return true;
    })
    .map(u => u.toProfileJSON());
}

// Update user
async function updateUser(id, updates) {
  if (isConnected() && !useMemoryFallback()) {
    return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }

  const user = memoryUsers.find(u => u._id.toString() === id.toString());
  if (!user) return null;

  Object.assign(user, updates, { updatedAt: new Date() });
  return user.toProfileJSON();
}

// Get all farmers with account status
async function getFarmers() {
  if (isConnected() && !useMemoryFallback()) {
    return await User.find({ role: 'FARMER' }).select('-password');
  }
  return memoryUsers
    .filter(u => u.role === 'FARMER')
    .map(u => u.toProfileJSON());
}

// Find farmer by ID, Email, or farmerId
async function getFarmerById(identifier) {
  if (!identifier) return null;
  const idStr = identifier.toString().toLowerCase();

  if (isConnected() && !useMemoryFallback()) {
    return await User.findOne({
      role: 'FARMER',
      $or: [
        { _id: identifier },
        { email: idStr },
        { farmerId: identifier }
      ]
    }).select('-password');
  }

  const u = memoryUsers.find(user => 
    user.role === 'FARMER' && (
      user._id.toString() === identifier.toString() ||
      user.email.toLowerCase() === idStr ||
      user.farmerId === identifier ||
      (identifier === 'farmer_1' && user.email === 'farmer@agrobridge.demo') ||
      (identifier === 'user_farmer_1' && user.email === 'farmer@agrobridge.demo') ||
      (identifier === 'farmer_2' && user.email === 'anita@agrobridge.demo') ||
      (identifier === 'farmer_3' && user.email === 'mukesh@agrobridge.demo') ||
      (identifier === 'farmer_4' && user.email === 'rajesh@agrobridge.demo')
    )
  );
  return u ? (u.toProfileJSON ? u.toProfileJSON() : u) : null;
}

// Update farmer status
async function updateFarmerStatus(identifier, { status, reason, duration, notes }) {
  const farmer = await getFarmerById(identifier);
  if (!farmer) return null;

  const validStatuses = ['ACTIVE', 'WARNING', 'UNDER_REVIEW', 'TEMPORARILY_UNLISTED', 'SUSPENDED', 'BANNED'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  let unlistedUntil = null;
  if (status === 'TEMPORARILY_UNLISTED') {
    const days = parseInt(duration) || 7;
    unlistedUntil = new Date(Date.now() + days * 86400000);
  }

  const updates = {
    accountStatus: status,
    statusReason: reason || '',
    unlistedUntil,
    statusUpdatedAt: new Date(),
    adminNotes: notes || ''
  };

  return await updateUser(farmer._id || farmer.userId, updates);
}

// Restore farmer to ACTIVE
async function restoreFarmer(identifier, notes = '') {
  const farmer = await getFarmerById(identifier);
  if (!farmer) return null;

  const updates = {
    accountStatus: 'ACTIVE',
    statusReason: 'Restored by administrator',
    unlistedUntil: null,
    statusUpdatedAt: new Date(),
    adminNotes: notes || 'Account privileges restored'
  };

  return await updateUser(farmer._id || farmer.userId, updates);
}

module.exports = {
  seedDemoAccounts,
  findByEmail,
  findByBusinessName,
  findById,
  createUser,
  listUsers,
  updateUser,
  getFarmers,
  getFarmerById,
  updateFarmerStatus,
  restoreFarmer,
  getMemoryUsers: () => memoryUsers
};
