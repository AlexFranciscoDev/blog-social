const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const check = require('../middlewares/auth');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
// Set multer
const uploads = multer({storage});

// Define route
router.get('/test', check.auth, UserController.testUser);
router.post('/signup', UserController.signup);
router.post('/login', UserController.login)
router.post('/logout', UserController.logout);
router.get('/profile/:id?', check.auth, UserController.profile);
router.put('/editProfile', check.auth, UserController.editProfile);
router.put('/changePassword', check.auth, UserController.changePassword);
router.delete('/deleteUser', check.auth, UserController.deleteUser);
router.post('/upload', [check.auth, uploads.single('featuredImage')], UserController.upload);
router.get('/profileimage/:filename', check.auth, UserController.getProfileImg);



module.exports = router;

