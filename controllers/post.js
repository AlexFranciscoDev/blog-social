const Post = require('../models/post');
const fs = require('fs');

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
    const newPost = new Post({
        title: params.title,
        content: params.content,
        image: req.file.filename,
        author: req.user.id
    });
    newPost.save()
        .then((userSaved) => {
            return res.status(200).send({
                status: 'Success',
                message: 'Creating post',
                userSaved: userSaved
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'Can\'t create post'
            })
        })
}

/**
 * getSinglePost
 * 
 * return a single post
 */
const getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
        const postFound = await Post.findOne({_id: postId})
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


module.exports = {
    getAllPosts,
    createPost,
    getPostById
}