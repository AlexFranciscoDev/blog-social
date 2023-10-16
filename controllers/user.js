const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');

// Tokens invalidos
const { blacklist } = require('../middlewares/auth');
const testUser = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'User controller'
    })
}

/**
 * signup
 * 
 * Register a new user
 */
const signup = (req, res) => {
    const params = req.body;
    if (!params.name || !params.nick || !params.email || !params.password) {
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

// Login de usuarios
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
                message: 'User not identified correctly'
            })
        }
        const token = jwt.createToken(user);
        // req.user.token = token;
        // Comprobar su contraseña
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
    // Si es correcta devolvemos el token
    // Devolver datos del usuario
    // return res.status(200).send({
    //     status: 'Success',
    //     message: 'User logged in succesfully',
    //     params
    // })
}

const logout = (req, res) => {
    const tokenToInvalidate = req.body.token;
    if (blacklist.has(tokenToInvalidate)) {
        return res.status(401).send({
            status: 'Error',
            message: 'Token not valid'
        })
    }
    blacklist.add(tokenToInvalidate);
    console.log(blacklist);
    return res.status(200).send({
        status: 'Success',
        message: 'Loggin out',
        list: blacklist.entries,
        tokenToInvalidate,
    })
}


module.exports = {
    testUser,
    signup,
    login,
    logout
}