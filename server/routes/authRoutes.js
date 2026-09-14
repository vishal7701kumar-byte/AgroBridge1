const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected endpoints
router.get('/me', protect, authController.getMe);
router.get('/users', protect, authorize('ADMIN'), authController.getAllUsers);

module.exports = router;
