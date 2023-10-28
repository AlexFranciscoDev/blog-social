const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment');
const check = require('../middlewares/auth');

router.post('/save/:postId', check.auth, CommentController.newComment);

module.exports = router;