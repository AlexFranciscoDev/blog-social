const { Schema, model } = require('mongoose');

const PostSchema = Schema({
    title: {
        type: 'string',
        required: true
    },
    content: {
        type: 'string',
        required: true
    },
    image: {
        type: 'string',
        default: 'default.png'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            type: Schema.ObjectId,
            ref: 'Comment'
        }
    ],
    created_at: {
        type: 'Date',
        default: Date.now()
    }
})

module.exports = model('Post', PostSchema, 'posts');