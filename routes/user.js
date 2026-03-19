const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const check = require('../middlewares/auth');
const multer = require('multer');


const { avatarStorage } = require('../config/cloudinary');

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const uploads = multer({
    storage: avatarStorage,
    limits: { fileSize: MAX_SIZE }
});

const handleUpload = (req, res, next) => {
    uploads.single('featuredImage')(req, res, (err) => {
        if (err && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({ status: 'Error', message: 'Image too large. Maximum size is 5 MB.' });
        }
        if (err) {
            return res.status(500).send({ status: 'Error', message: err.message });
        }
        next();
    });
};

// Define route
router.post('/signup', UserController.signup);
router.post('/login', UserController.login)
router.post('/logout', UserController.logout);
router.get('/profile/:id?', check.auth, UserController.profile);
router.put('/editProfile', check.auth, UserController.editProfile);
router.put('/changePassword', check.auth, UserController.changePassword);
router.delete('/deleteUser', check.auth, UserController.deleteUser);
router.post('/upload', [check.auth, handleUpload], UserController.upload);
router.get('/profileimage/:filename', UserController.getProfileImg);



module.exports = router;

