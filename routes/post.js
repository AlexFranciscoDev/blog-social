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
router.get('/:page?', check.auth, PostController.getAllPosts);
router.get('/singlePost/:id', check.auth, PostController.getPostById);
router.get('/user/:id/:page?', check.auth, PostController.getPostsByUser);
router.post('/save', [check.auth, uploads.single('featuredImage')], PostController.createPost);
router.put('/edit/:id', check.auth, PostController.editPost);
router.delete('/delete/:id', check.auth, PostController.deletePost);
router.post('/upload/:id', [check.auth, uploads.single('featuredImage')], PostController.upload);
router.get('/postImage/:filename', PostController.getImage);
module.exports = router;

