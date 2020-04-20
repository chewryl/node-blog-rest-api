const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const sequelize = require('./util/database');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const Post = require('./models/post');
const User = require('./models/user');

const app = express(); 
require('dotenv').config(); // to access env variables through process.env 

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    }, 
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'
    ) { // then it is a valid file so we return no error
        cb(null, true);
    } else {
        cb(null, false);
    }
};

/* app.use(bodyParser.urlencoded()); */ // x-www-form-urlencoded <form>

app.use(bodyParser.json()); // application/json
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images'))) // path.join constructs an absolute path to the images folder 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth',authRoutes);

app.use((error, req, res, next) => {    // will be executed whenever an error is thrown or forwarded w/ next()
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    })
});

Post.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Post);

sequelize.sync()
.then(result => {
    app.listen(8080);
})
.catch(err => {
    console.log(`Something wrong with db connection - ${err}, this is not cool.`)
})


