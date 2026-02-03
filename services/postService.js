const Post = require('../models/post');
const User = require('../models/user');
const { ObjectId } = require('mongoose').Types;

const getPostById = async (postId) => {
    try {
        const postFound = await Post.findOne({ _id: postId })
            .populate('author')
            .populate({
                path: 'comments',
                populate: [
                    { path: 'author' }, // Populate del autor del comentario
                    {
                        path: 'responses',
                        populate: { path: 'author' } // Populate del autor de las respuestas al comentario
                    }
                ]
            });
        return postFound;
    } catch (error) {
        throw new Error('Error getting the post');
    }
}

const compareUserAuthor = (user, author) => {
    try {
        const userId = new ObjectId(user);
        if (!userId.equals(author._id)) {
            throw new Error('You are not allowed to access this post');
        }
        return true;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getPostById,
    compareUserAuthor
}