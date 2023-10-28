const { Schema, model } = require('mongoose');

const CommentSchema = Schema({
    content: {
        type: 'string',
        required: true
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.ObjectId,
        ref: 'Post',
        required: true
    },
    parentComment: {
        type: Schema.ObjectId,
        ref: 'Comment'
    },
    responses: [
        {
            type: Schema.ObjectId,
            ref: 'Comment'
        }
    ]
})

module.exports = model('Comment', CommentSchema, 'comments');