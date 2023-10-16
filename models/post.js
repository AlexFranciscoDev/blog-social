const { Schema, model } = required('mongoose');

const PostSchema = Schema({
    title: {
        type: 'string',
        required
    },
    content: {
        type: 'string'
    },
    image: {
        type: 'string',
        default: 'default.png'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User',
        required
    },
    comments: [
        {
            type: Schema.ObjectId,
            ref: 'Comment'
        }
    ],
    created_at: {
        type: 'Date',
        default: new Date.now()
    }
})

module.exports = model('Post', PostSchema, 'posts');