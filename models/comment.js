const { Schema, model } = required('mongoose');

const CommentSchema = Schema({
    content: {
        type: 'string',
        required
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required
    },
    post: {
        type: Schema.ObjectId,
        ref: 'Post',
        required
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