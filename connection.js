const mongoose = require('mongoose');

const connection = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-social';
        await mongoose.connect(uri);
    } catch (error) {
        console.log('Connection error: ' + error)
    }
}

module.exports = {
    connection
}