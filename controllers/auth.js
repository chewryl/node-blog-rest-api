const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Signup validation failed');
        error.statusCode = 422;
        error.data = errors.array(); // new property in this where we are storing the errors array
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            User.create({
                email: email,
                password: hashedPassword,
                name: name
            })
            .then(result => {
                res.status(201).json({
                    message: 'User created.', 
                    userId: result.id
                });
            })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};  

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    let loadedUser;
    User.findOne({where: {email: email}})
        .then(user => {
            if (!user) {
                const error = new Error('User with this email not found.');
                error.statusCode = 401;
                throw error;
            }
            // User exists
            loadedUser = user; 
            return bcrypt.compare(password, user.password);
        })
        .then(boolean => {
            console.log(loadedUser);
            if (!boolean) {    // coerces to false
                const error = new Error('Incorrect password.');
                error.statusCode = 401;
                throw error; 
            }
            // Password matches - create JWT
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser.id
            },
            'verySecretStringThatShouldBeLong',
            { expiresIn: '1h' }
            );
            res.status(200).json({token: token, userId: loadedUser.id});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};