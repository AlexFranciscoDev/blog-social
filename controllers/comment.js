const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
/**
 * createComment
 * 
 * create new comment
 */
const newComment = async (req, res) => {
    // Get content and check if its not empty
    const params = req.body;
    if (!params.content) return res.status(404).send({status: 'Error', message: 'Fill all the required fields'})
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
            {_id: postId},
            {$push: {comments: newComment}}
        )
        // Save comment in user comments
        await User.findOneAndUpdate(
            {_id: req.user.id},
            {$push: {comments: newComment}}
        )
        return res.status(200).send({
            status: 'Success',
            message: 'Comment created succesfully',
            comment: newComment
        })
    } catch (error) {
        return res.status(404).send({status: 'Error', message: 'Post not found', error: error.message})
    }
}

module.exports = {
    newComment
}