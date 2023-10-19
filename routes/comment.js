const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment');

router.get('/test', CommentController.testComment);

module.exports = router;