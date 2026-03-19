const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const postStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'blog-social/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    }
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'blog-social/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    }
});

module.exports = { postStorage, avatarStorage };
