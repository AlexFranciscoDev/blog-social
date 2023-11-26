const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment');
const check = require('../middlewares/auth');

router.post('/save/:postId', check.auth, CommentController.newComment);
router.put('/edit/:id', check.auth, CommentController.editComment);
router.delete('/delete/:id', check.auth, CommentController.deleteComment);
router.post('/reply/:id', check.auth, CommentController.replyToComment);


module.exports = router;