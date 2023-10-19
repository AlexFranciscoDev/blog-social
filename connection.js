const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.connect('mongodb://localhost:27017/blog-social');
    } catch (error) {
        console.log('Connection error: ' + error)
    }
}

module.exports = {
    connection
}