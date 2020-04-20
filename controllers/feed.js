const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2; // same value is in the frontend
    const offset = (currentPage -1) * perPage;
    
    try {
    let totalItems = await (await Post.findAll()).length;
        const posts = await Post.findAll({offset: offset, limit: perPage});
    
        res.status(200).json({ 
            message: 'Fetched posts successfully',
            posts: posts,
            totalItems: totalItems // for frontend to know what btns to display
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Entered data is invalid.');
        error.statusCode = 422;
        throw error;
        /* return res.status(422).json({
            message: 'Entered data is invalid .',
            errors: errors.array()
        }); */
    }
    if (!req.file) { // if not set
        const error = new Error('No image provided.');
        error.statusCode = 422; 
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    User.findByPk(req.userId)
        .then(user => {
            //console.log(user.id);
            user.createPost({
                title: title,
                content: content,
                creator: user.email,
                imageUrl: imageUrl
            });
        })
        .then(result => {
            res.status(201).json({ 
                message: 'Post created successfully',
                post: result
            });
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) { // will not have it set though
                err.statusCode = 500; // to signal a server-side error
            }
            //throw err; // will not work bc this is in async code
            next(err);
        });
}; 

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log('POST ID HERE !!!!',postId);
  Post.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
    const postId = parseInt(req.params.postId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('The data you entered is invalid');
        throw error;     
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; // bc we are looking for 'image' on frontend
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) { // some validation 
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error; 
    }
    // If we reach here, data is valid & we can update in db
    //Post.findOne({where: {id: postId, userId: req.userId}})
    Post.findByPk(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            // Check if post belongs to user
            if (post.userId !== req.userId){
                const error = new Error('You can only edit posts that you created');
                error.statusCode = 403;
                throw error;
            }
            // Authenticated so update 
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save()
            .then(result => {
                return res.status(200).json({  
                    message: 'Post updated.',
                    post: post
                });
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findByPk(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error; 
            }
            // check if creator is currently logged in user
            if (post.userId !== req.userId) {
                const error = new Error('You can only delete posts that you created');
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl)
            return Post.destroy({where: {id: postId}});
        })
        .then(result => {
            console.log(result);
            res.status(200).json({message: 'Deleted post.'});
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};