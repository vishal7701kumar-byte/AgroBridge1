const userService = require('../services/userService');
const { generateToken } = require('../middleware/authMiddleware');

const ROLE_DISPLAY_NAMES = {
  FARMER: 'Farmer',
  CONSUMER: 'Consumer',
  BULK_BUYER: 'Bulk Buyer',
  DRIVER: 'Driver',
  ADMIN: 'Admin'
};

const ROLE_LOGIN_PATHS = {
  FARMER: '/farmer/login',
  CONSUMER: '/consumer/login',
  BULK_BUYER: '/bulk-buyer/login',
  DRIVER: '/driver/login',
  ADMIN: '/admin/login'
};

/**
 * @desc    Authenticate user & validate role
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, businessName, password, role, portalRole } = req.body;
    const requestedRole = role || portalRole;

    if ((!email && !businessName) || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both your account identifier (email/business name) and password.'
      });
    }

    // Lookup user: support email, or businessName for bulk buyers
    let user = null;
    if (email) {
      user = await userService.findByEmail(email);
    }
    if (!user && businessName && requestedRole === 'BULK_BUYER') {
      user = await userService.findByBusinessName(businessName);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found matching the provided details.'
      });
    }

    // Verify Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.'
      });
    }

    // STRICT ROLE VALIDATION
    // If user attempts to login through a portal different from their registered role
    if (requestedRole && user.role.toUpperCase() !== requestedRole.toUpperCase()) {
      const actualRoleKey = user.role.toUpperCase();
      const actualDisplayName = ROLE_DISPLAY_NAMES[actualRoleKey] || user.role;
      const correctPath = ROLE_LOGIN_PATHS[actualRoleKey] || '/login';

      return res.status(403).json({
        success: false,
        roleMismatch: true,
        actualRole: user.role,
        actualRoleDisplayName: actualDisplayName,
        correctLoginPath: correctPath,
        error: `This account is registered as a ${actualDisplayName}. Please login through the ${actualDisplayName} Login page.`
      });
    }

    // Successful authentication: generate token
    const token = generateToken(user);
    const userProfile = user.toProfileJSON ? user.toProfileJSON() : user;

    res.json({
      success: true,
      token,
      user: userProfile,
      redirectUrl: `/${user.role.toLowerCase().replace('_', '-')}/dashboard`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new user with role-specific profile
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      // Farmer
      farmName,
      farmLocation,
      state,
      district,
      // Consumer
      address,
      city,
      // Bulk Buyer
      businessName,
      businessType,
      businessAddress,
      // Driver
      vehicleType,
      vehicleNumber,
      vehicleCapacity
    } = req.body;

    const normalizedRole = (role || '').toUpperCase();

    // Prevent public Admin registration
    if (normalizedRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin registration is not publicly available. Only predefined administrator accounts can access the platform.'
      });
    }

    if (!['FARMER', 'CONSUMER', 'BULK_BUYER', 'DRIVER'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role specified. Supported registration roles: FARMER, CONSUMER, BULK_BUYER, DRIVER.`
      });
    }

    // Common validations
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, and password are required.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match. Please verify your password and confirmation.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already in use
    const existing = await userService.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Prepare role-specific document
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      password,
      role: normalizedRole,
      state: state || 'Madhya Pradesh',
      city: city || 'Bhopal'
    };

    if (normalizedRole === 'FARMER') {
      userData.farmName = farmName || `${name}'s Farm`;
      userData.farmLocation = farmLocation || 'Agricultural Belt';
      userData.district = district || 'Bhopal';
    } else if (normalizedRole === 'CONSUMER') {
      userData.address = address || 'Residential Area';
      userData.city = city || 'Bhopal';
    } else if (normalizedRole === 'BULK_BUYER') {
      userData.businessName = businessName || `${name} Enterprises`;
      userData.businessType = businessType || 'Distributor';
      userData.businessAddress = businessAddress || address || 'Commercial Hub';
      userData.city = city || 'Bhopal';
    } else if (normalizedRole === 'DRIVER') {
      userData.vehicleType = vehicleType || 'Pickup Truck';
      userData.vehicleNumber = vehicleNumber || 'MP 04 AB 0000';
      userData.vehicleCapacity = vehicleCapacity || '1.0 Ton';
      userData.driverStatus = 'OFFLINE'; // Explicitly OFFLINE after registration
      userData.city = city || 'Bhopal';
    }

    const newUser = await userService.createUser(userData);
    const token = generateToken(newUser);
    const userProfile = newUser.toProfileJSON ? newUser.toProfileJSON() : newUser;

    const roleDisplayName = ROLE_DISPLAY_NAMES[normalizedRole] || normalizedRole;

    res.status(201).json({
      success: true,
      token,
      user: userProfile,
      message: `Account created successfully as ${roleDisplayName}!`,
      redirectUrl: `/${normalizedRole.toLowerCase().replace('_', '-')}/dashboard`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const userProfile = user.toProfileJSON ? user.toProfileJSON() : user;
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (for Admin dashboard)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const roleFilter = req.query.role;
    const users = await userService.listUsers(roleFilter ? { role: roleFilter } : {});
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};
