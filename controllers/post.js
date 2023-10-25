const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
// Services
const getPostService = require('../services/getPostService');

/**
 * getAllPosts
 * 
 * return all the posts
 */
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'nick email');
        if (posts.length <= 0) {
            return req.status(200).send({ status: 'Success', message: 'No posts found' })
        }
        return res.status(200).send({
            status: 'Success',
            message: 'Getting all posts',
            posts: posts
        })

    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Error, something went wrong',
            error: error
        })
    }
}

/**
 * createPost
 * 
 * create a new post
 */
const createPost = (req, res) => {
    const params = req.body;
    if (!params.title || !params.content) {
        return res.status(400).send({
            status: 'Error',
            message: 'Fill all the required fields'
        })
    }
    // File settings
    let imageName = req.file.originalname;
    let imageSplit = imageName.split('\.')
    let extension = imageSplit[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedExtensions.includes(extension)) {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).send({
            status: 'Error',
            message: 'File extension not supported'
        })
    }
    // Create post object
    const newPost = new Post({
        title: params.title,
        content: params.content,
        image: req.file.filename,
        author: req.user.id
    });

    newPost.save()
        .then(async (postSaved) => {
            return User.findOneAndUpdate(
                { _id: req.user.id },
                { $push: { posts: postSaved } }
            );
        })
        .then((postSaved) => {
            return res.status(200).send({
                status: 'Success',
                message: 'Creating post',
                postSaved: postSaved
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'Can\'t create post',
                error: error.message
            })
        })
}

/**
 * editPost
 * 
 * Edit a single post
 */
const editPost = async (req, res) => {
    // Get params
    const params = req.body;
    const postId = req.params.id;
    const { title, content } = params;
    // Create updated post
    const updatedPost = {}
    if (title) updatedPost.title = title;
    if (content) updatedPost.content = content;
    let postToEdit;
    try {
        // Get the post to edit
        postToEdit = await getPostService.getPostById(postId);
        // Check if its not my post
        // Otherwise we update the post
        const userId = new ObjectId(req.user.id);
        if (!userId.equals(postToEdit.author)) {
            return res.status(401).send({
                status: 'Error',
                message: 'You are not allowed to edit this post'
            })
        } else {
            const update = await Post.findOneAndUpdate({_id: postId}, updatedPost, {new: true})
            return res.status(200).send({
                status: 'Success',
                message: 'Editing post',
                updatedPost: update
            })
        }

    } catch (error) {
        // Check if the post exists
        if (!postToEdit) {
            return res.status(404).send({ status: 'Error', message: 'Post not found' })
        }
        return res.status(500).send({
            status: 'Error',
            message: 'Internal Server Error',
            error: error.message
        })
    }

}

/**
 * getSinglePost
 * 
 * return a single post
 */
const getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
        const postFound = await getPostService.getPostById(postId);
        if (!postFound) {
            return res.status(400).send({
                status: 'Error',
                message: 'Post not found',
                error: error.message
            })
        }
        return res.status(200).send({
            status: 'Success',
            message: 'Getting one post',
            post: postFound
        })
    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Internal server error',
            error: error.message
        })
    }
}

/**
 * getPostsByUser
 * 
 * return a single post
 */
const getPostsByUser = async (req, res) => {
    try {
        // If we pass an argument we find for this user, otherwise we find for the logged in user
        let userId = req.user.id;
        if (req.params.id) userId = req.params.id;
        if (!req.user) {
            return res.status(401).send({
                status: 'Error',
                message: 'User not logged in'
            })
        }
        const posts = await Post.find({ author: userId })
        if (posts.length === 0) {
            return res.status(404).send({
                status: 'Success',
                message: 'Posts not found'
            })
        }
        return res.status(200).send({
            status: 'Success',
            message: 'Getting posts by user',
            user: userId,
            posts
        })
    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Internal server error',
            error: error
        })
    }
}

module.exports = {
    getAllPosts,
    createPost,
    editPost,
    getPostById,
    getPostsByUser
}