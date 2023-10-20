const Post = require('../models/post');
const fs = require('fs');

const getAllPosts = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Getting all posts'
    })
}

const createPost = (req, res) => {
    const params = req.body;
    if (!params.title || !params.content) {
        return res.status(400).send({
            status: 'Error',
            message: 'Fill all the required fields'
        })
    }
    // File settings
    let imageName = req.file.originalname;
    let imageSplit = imageName.split('\.')
    let extension = imageSplit[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedExtensions.includes(extension)) {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).send({
            status: 'Error',
            message: 'File extension not supported'
        })
    }
    const newPost = new Post({
        title: params.title,
        content: params.content,
        image: req.file.filename,
        author: req.user.id
    });
    newPost.save()
        .then((userSaved) => {
            return res.status(200).send({
                status: 'Success',
                message: 'Creating post',
                userSaved: userSaved
            })
        })
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'Can\'t create post'
            })
        })
}


module.exports = {
    getAllPosts,
    createPost
}