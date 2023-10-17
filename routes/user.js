const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const check = require('../middlewares/auth');

// Define route
router.get('/test', check.auth, UserController.testUser);
router.post('/signup', UserController.signup);
router.post('/login', UserController.login)
router.post('/logout', UserController.logout);
router.get('/profile/:id?', check.auth, UserController.profile);
router.put('/editProfile', check.auth, UserController.editProfile);
router.put('/changePassword', check.auth, UserController.changePassword);

module.exports = router;

