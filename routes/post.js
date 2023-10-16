const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post');

// Define route
router.get('/test', PostController.testPost);

module.exports = router;

