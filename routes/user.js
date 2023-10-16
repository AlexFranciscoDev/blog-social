const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const check = require('../middlewares/auth');

// Define route
router.get('/test', check.auth, UserController.testUser);
router.post('/signup', UserController.signup);
router.post('/login', UserController.login)
router.post('/logout', UserController.logout);

module.exports = router;

