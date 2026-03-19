const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post');
const check = require('../middlewares/auth');
const multer = require('multer');
const { postStorage } = require('../config/cloudinary');

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const uploads = multer({
    storage: postStorage,
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
router.get('/:page?', check.auth, PostController.getAllPosts);
router.get('/singlePost/:id', check.auth, PostController.getPostById);
router.get('/user/:id/:page?', check.auth, PostController.getPostsByUser);
router.post('/save', [check.auth, handleUpload], PostController.createPost);
router.put('/edit/:id', check.auth, PostController.editPost);
router.delete('/delete/:id', check.auth, PostController.deletePost);
router.post('/upload/:id', [check.auth, handleUpload], PostController.upload);
router.get('/postImage/:filename', PostController.getImage);
module.exports = router;

