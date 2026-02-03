const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
// Services
const postService = require('../services/postService');

/**
 * getAllPosts
 * 
 * return all the posts
 */
const getAllPosts = async (req, res) => {
    try {
        // Check if i get the page, otherwise use number 1
        let page = 1;
        if (req.params.page) page = req.params.page;
        // Number of posts per page
        const itemsPerPage = 6;
        const query = {};
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: [{
                path: 'author',
                select: 'nick email image'
            }]
        }
        const posts = await Post.paginate(query, options);
        // const posts = await Post.find().populate('author', 'nick email image');
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
            error: error.message
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
            console.log(postSaved);
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
        postToEdit = await postService.getPostById(postId);
        // Check if its not my post
        if (postService.compareUserAuthor(req.user.id, postToEdit.author)) {
            const update = await Post.findOneAndUpdate({ _id: postId }, updatedPost, { new: true })
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
 * deletePost
 * 
 * return a single post
 */
const deletePost = async (req, res) => {
    const postId = req.params.id;
    let postToDelete;
    try {
        // Get post to delete
        postToDelete = await postService.getPostById(postId);
        // Check if its not my post
        if (postService.compareUserAuthor(req.user.id, postToDelete.author)) {
            const deletedPost = await Post.findOneAndDelete({ _id: postId });
            return res.status(200).send({
                status: 'Success',
                message: 'Deleting post',
                postDeleted: postToDelete
            })
        }
    } catch (error) {
        if (!postToDelete) {
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
        const postFound = await postService.getPostById(postId);
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
        // Check if i get the page, otherwise use number 1
        let page = 1;
        if (req.params.page) page = req.params.page;
        // Number of posts per page
        const itemsPerPage = 6;
        const query = {author: userId};
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: [{
                path: 'author'
            }]
        }
        if (!req.user) {
            return res.status(401).send({
                status: 'Error',
                message: 'User not logged in'
            })
        }
        // const posts = await Post.find({ author: userId })
        const posts = await Post.paginate(query, options);
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

/**
 * upload
 * 
 * Upload image 
 */
const upload = async (req, res) => {
    const postId = req.params.id;
    if (!req.file) {
        return res.status(404).send({
            status: 'Error',
            message: 'File not found'
        })
    }
    let image = req.file.originalname;
    let imageSplit = image.split('\.');
    let extension = imageSplit[1];
    let filePath;
    if (extension !== 'jpg' && extension !== 'png' && extension !== 'jpeg' && extension !== 'gif') {
        filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).send({
            status: 'Error',
            message: 'File extension not supported'
        })
    }

    let postToEdit;
    try {
        // Get the post to edit
        let postToEdit = await postService.getPostById(postId);
        // Check if its not my post
        if (postService.compareUserAuthor(req.user.id, postToEdit.author)) {
            console.log('entrando en condicion');
            const update = await Post.findOneAndUpdate({ _id: postId }, { image: req.file.filename }, { new: true })
            return res.status(200).send({
                status: 'Success',
                message: 'Editing image post',
                updatedPost: update
            })
        }
    } catch (error) {
        // Check if the post exists
        if (!postToEdit) {
            filePath = req.file.path;
            fs.unlinkSync(filePath);
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
 * getImage
 * 
 * Display profile image
 */
const getImage = (req, res) => {
    const file = req.params.filename;
    const filePath = './uploads/posts/' + file;
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: 'Error',
                message: 'Image not found'
            })
        }
    })
    return res.sendFile(path.resolve(filePath));
}

module.exports = {
    getAllPosts,
    createPost,
    editPost,
    deletePost,
    getPostById,
    getPostsByUser,
    upload,
    getImage
}