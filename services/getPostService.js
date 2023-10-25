const Post = require('../models/post');

const getPostById = async (postId) => {
    try {
        const postFound = await Post.findOne({_id: postId});
        return postFound;
    } catch (error) {
        throw new Error('Error getting the post');
    }
}

module.exports = {
    getPostById
}