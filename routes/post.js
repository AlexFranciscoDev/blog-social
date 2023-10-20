const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post');
const check = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/posts')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const uploads = multer({storage});

// Define route
router.get('/posts', check.auth, PostController.getAllPosts);
router.post('/save', [check.auth, uploads.single('featuredImage')], PostController.createPost);

module.exports = router;

