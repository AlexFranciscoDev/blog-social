const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');
const fs = require('fs'); // Manipulate files (delete files, create directories)
const path = require('path'); // Use absolute path

// Tokens invalidos
const { blacklist } = require('../middlewares/auth');

/**
 * signup
 * 
 * Register a new user
 */
const signup = (req, res) => {
    const params = req.body;
    if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: 'Error',
            message: 'User not registered, data not provided',
        })
    }
    User.find({
        $or: [
            { nick: params.nick },
            { email: params.email }
        ]
    }).then(async(users) => {
        if (users.length > 0)  {
            return res.status(404).send({
                status: 'Error',
                message: 'User already exists'
            })
        }
        // Encrypt password
        let pwdEncrypted = await bcrypt.hash(params.password, 10);
        params.password = pwdEncrypted;
        let newUser = new User(params);
        newUser.save();
        return res.status(200).send({
            status: 'Success',
            message: 'User registered succesfully',
            newUser

        })
    }).catch((error) => {
        return res.status(404).send({
            status: 'Error',
            message: 'Something went wrong, user not registered',
            error: error.message
        })
    })
}

/**
 * login
 * 
 * Login user
 */
const login = (req, res) => {
    // Recoger los datos
    const params = req.body;
    if (!params.email || !params.password) {
        return res.status(404).send({
            status: 'Error',
            message: 'Fill all the required fields'
        })
    }
    // Buscar en la base de datos si existe el usuario
    User.findOne(
        {email: params.email}
    )
    .then((user) => {
        if (user.length === 0) {
            return res.status(404).send({
                status: 'Error',
                message: 'User not found'
            });
        }
        let pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).send({
                status: 'Error',
                message: 'User password is not correct'
            })
        }
        const token = jwt.createToken(user);
        return res.status(200).send({
            status: 'Success',
            message: 'User found',
            user: user,
            token
        })
    }).catch((error) => {
        return res.status(404).send({
            status: 'Error',
            message: 'User not found',
            error: error.message
        })
    })
}

/**
 * logout
 * 
 * Logout user
 */
const logout = (req, res) => {
    const tokenToInvalidate = req.body.token;
    if (blacklist.has(tokenToInvalidate)) {
        return res.status(401).send({
            status: 'Error',
            message: 'Token not valid'
        })
    }
    blacklist.add(tokenToInvalidate);
    return res.status(200).send({
        status: 'Success',
        message: 'Loggin out',
        list: blacklist.entries,
        tokenToInvalidate,
    })
}

/**
 * profile
 * 
 * Display user data
 */
const profile = (req, res) => {
    let userId = req.user.id;
    const params = req.params;

    if (params.id) userId = params.id;

    User.findOne({_id: userId})
    .select({password: 0, __v: 0, role: 0})
    .then((user) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Showing profile data',
            user
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'User not found',
            error: error.message
        })
    })
}

/**
 * editProfile
 * 
 * Edit user profile data
 */
const editProfile = (req, res) => {
    const userId = req.user.id;
    const params = req.body;
    const { name, surname, nick, email} = params;
    const updatedProfile = {}
    
    if (name) updatedProfile.name = name;
    if (surname) updatedProfile.surname = surname;
    if (nick) updatedProfile.nick = nick;
    if (email) updatedProfile.email = email;

    User.findOneAndUpdate({_id: userId}, updatedProfile, {new: true})
    .then((userUpdated) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Editing data',
            userUpdated
        })
    })
}

/**
 * changePassword
 * 
 * Change logged users password
 */
const changePassword = async (req, res) => {
    const userLogged = req.user.id;
    const params = req.body;
    const password = req.body.password;
    console.log(params);
    const confirmPassword = req.body.confirmPassword
    if (!params.password || !params.confirmPassword) return res.status(400).send({status: 'Error', message: 'Fill the fields with the new password'})
    if (params.password !== params.confirmPassword) return res.status(400).send({status: 'Error', message: 'The passwords do not match'})
    let userUpdated = {}

    try {
        const user = await User.find({_id: userLogged})
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'User not found',
              });
        })

        userUpdated.password = await bcrypt.hash(password, 10);
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            message: 'An error occurred',
            error: error.message,
          });
    }

    User.findOneAndUpdate({_id: userLogged}, {password: userUpdated.password}, {new: true})
    .then((userUpdated) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Password updated'
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'The user cannot be updated'
        })
    })
}

/**
 * const changePassword = async (req, res) => {
    const userLogged = req.user.id;
    const params = req.body;
    console.log(params);
    const currentPassword = req.body.currentPassword;
    const confirmPassword = req.body.confirmPasswordñ
    console.log('current password: ' + currentPassword);
    console.log('confirm password: ' + confirmPassword);
    if (!params.currentPassword || !params.confirmPassword) return res.status(400).send({status: 'Error', message: 'Fill the fields with the new password'})
    if (params.currentPassword !== params.confirmPassword) return res.status(400).send({status: 'Error', message: 'The passwords do not match'})
    let userUpdated = {}

    try {
        const user = await User.find({_id: userLogged})
        .catch((error) => {
            return res.status(400).send({
                status: 'Error',
                message: 'User not found',
              });
        })

        userUpdated.currentPassword = await bcrypt.hash(currentPassword, 10);
    } catch (error) {
        return res.status(400).send({
            status: 'Error',
            message: 'An error occurred',
            error: error.message,
          });
    }

    User.findOneAndUpdate({_id: userLogged}, {password: userUpdated.currentPassword}, {new: true})
    .then((userUpdated) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Password updated'
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'The user cannot be updated'
        })
    })
}
 */

/**
 * deleteUser
 * 
 * Delete the logged in user
 */
const deleteUser = (req, res) => {
    const userId = req.user.id;
    User.findOneAndDelete({_id: userId})
    .then((userDeleted) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Deleting user permanently',
            userDeleted
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'Cant delete user',
            error
        })
    })
}

/**
 * upload
 * 
 * Upload profile image
 */
const upload = (req, res) => {
    if (!req.file) {
        return res.status(400).send({
            status: 'Error',
            message: 'File not found'
        })
    }
    let image = req.file.originalname;
    let imageSplit = image.split('\.');
    let extension = imageSplit[1];
    if (extension !== 'jpg' && extension !== 'png' && extension !== 'jpeg' && extension !== 'gif') {
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);
        return res.status(400).send({
            status: 'Error',
            message: 'File extension not supported'
        })
    }
    User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true})
    .then((userUpdated) => {
        return res.status(200).send({
            status: 'Success',
            message: 'Image uploaded successfully',
            file: req.file
        })
    })
    .catch((error) => {
        return res.status(400).send({
            status: 'Error',
            message: 'An error occured. Image not uploaded',
            error: error
        })
    })
}

/**
 * getProfileImage
 * 
 * Display profile image
 */
const getProfileImg = (req, res) => {
    const file = req.params.filename;
    const filePath = './uploads/avatars/' + file;
    const defaultImagePath = './uploads/avatars/default.jpg';
    
    fs.stat(filePath, (error, exists) => {
        // Si hay error o el archivo no existe
        if (error || !exists) {
            // Devolver la imagen por defecto en lugar de error
            console.log('Image not found, returning default image');
            return res.sendFile(path.resolve(defaultImagePath));
        }
        
        // Si el archivo SÍ existe, devolver la imagen solicitada
        return res.sendFile(path.resolve(filePath));
    })
}


module.exports = {
    signup,
    login,
    logout,
    profile,
    editProfile,
    changePassword,
    deleteUser,
    upload,
    getProfileImg
}