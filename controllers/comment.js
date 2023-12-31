const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const { ObjectId } = require('mongoose').Types;
/**
 * createComment
 * 
 * create new comment
 */
const newComment = async (req, res) => {
    // Get content and check if its not empty
    const params = req.body;
    if (!params.content) return res.status(404).send({ status: 'Error', message: 'Fill all the required fields' })
    // Check if the post exists
    const postId = req.params.postId;
    try {
        // Create new comment
        const newComment = new Comment({
            content: params.content,
            author: req.user.id,
            post: postId
        })
        // Save in the database
        await newComment.save(newComment);
        // Save comment in post
        await Post.findOneAndUpdate(
            { _id: postId },
            { $push: { comments: newComment } }
        )
        // Save comment in user comments
        await User.findOneAndUpdate(
            { _id: req.user.id },
            { $push: { comments: newComment } }
        )
        return res.status(200).send({
            status: 'Success',
            message: 'Comment created succesfully',
            comment: newComment
        })
    } catch (error) {
        return res.status(404).send({ status: 'Error', message: 'Post not found', error: error.message })
    }
}

/**
 * editComment
 * 
 * edit my comment
 */
const editComment = async (req, res) => {
    // Check params
    const params = req.body;
    if (!params.content || params.content.trim() == '') {
        return res.status(404).send({
            status: 'Error',
            message: 'Fill the required fields'
        })
    }
    try {
        // Check if comment exists
        const commentId = req.params.id;
        const commentToEdit = await Comment.findById(commentId)
            .catch(error => {
                return res.status(404).send({
                    status: 'Error',
                    message: 'Comment not found'
                })
            })
        // Check if its my comment
        if (commentToEdit.author != req.user.id) {
            return res.status(401).send({
                status: 'Error',
                message: 'You are not allowed to edit this comment'
            })
        }
        // Edit the comment
        Comment.findOneAndUpdate({ _id: commentId }, { content: params.content }, { new: true })
            .then((commentUpdated) => {
                return res.status(200).send({
                    status: 'Success',
                    message: 'Editing comment',
                    comment: commentUpdated
                })
            })
    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Internal Server Error',
            message: error.message
        })
    }
}

/**
 * deleteComment
 * 
 * delete my comment
 */
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        if (!commentId) {
            return res.status(404).send({
                status: 'Error',
                message: 'Comment id required'
            })
        }
        // Check if comment exists
        const commentToDelete = await Comment.findById(commentId)
            .catch(error => {
                return res.status(404).send({
                    status: 'Error',
                    message: 'Comment not found'
                })
            })
        // Check if its my comment
        if (commentToDelete.author != req.user.id) {
            return res.status(401).send({
                status: 'Error',
                message: 'You are not allowed to delete this comment'
            })
        }
        // Delete the commentt from user table
        const userUpdated = await User.findOneAndUpdate({ _id: req.user.id},
            { $pull: {comments: commentId} },
            { new: true })
        // Delete the comment from comment table
        await Comment.findOneAndDelete({_id: commentId})
        .then((commentDeleted) => {
            return res.status(200).send({
                status: 'Success',
                message: 'Deleting comment',
                commentDeleted: commentDeleted
            })
        })
    }
    catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Internal Server Error',
            error: error.message
        })
    }
}

const replyToComment = async (req, res) => {
    // Get id of the comment and the content
    const commentId = req.params.id;
    const content = req.body.content;
    try {
        if (!content) {
            return res.status(404).send({
                status: 'Error',
                message: 'Fill all the required fields'
            })
        }
        // Check if the parent comment exist
        const parentComment = await Comment.findById(commentId).exec();
        
        if (!parentComment) {
            return res.status(404).send({
                status: 'Error',
                message: 'Comment not found'
            })
        }
        // Create the new comment
        const newComment = new Comment({
            content: content,
            author: req.user.id,
            post: parentComment.post
        })
        // Save it in the dastabase
        await newComment.save();
        // Save it in comment
        await Comment.findOneAndUpdate(
            {_id: commentId},
            {$push: {responses: newComment}}
        )
        // Save comment in post
        await Post.findOneAndUpdate(
            { _id: parentComment.post },
            { $push: { comments: newComment } }
        )
        // Save it in user
        await User.findOneAndUpdate(
            { _id: req.user.id },
            { $push: { comments: newComment } }
        )
        return res.status(200).send({
            status: 'Success',
            message: 'reply to comment',
            newComment: newComment
        })
    } catch (error) {
        return res.status(500).send({
            status: 'Error',
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports = {
    newComment,
    editComment,
    deleteComment,
    replyToComment
}