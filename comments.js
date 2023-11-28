// Create web server

var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var User = require('../models/user');
var Post = require('../models/post');
var util = require('../util');

// Create a comment
router.post('/', util.isLoggedin, checkPostId, function(req, res){
  var post = res.locals.post;

  req.body.author = req.user._id;
  req.body.post = post._id;

  Comment.create(req.body, function(err, comment){
    if(err){
      req.flash('commentForm', { _id: null, form:req.body });
      req.flash('commentError', { _id:null, parentComment:req.body.parentComment, errors:util.parseError(err) });
    }
    return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
  });
});

// Update a comment
router.put('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res){
  var post = res.locals.post;

  req.body.updatedAt = Date.now();
  Comment.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, comment){
    if(err){
      req.flash('commentForm', { _id:req.params.id, form:req.body });
      req.flash('commentError', { _id:req.params.id, parentComment:req.body.parentComment, errors:util.parseError(err) });
    }
    return res.redirect('/posts/'+post._id+res.locals.getPostQueryString());
  });
});

// Delete a comment
router.delete('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res){
  var post = res.locals.post;

  Comment.findOne({_id:req.params.id}, function(err, comment){
    if(err) return res.json(err);

    // remove the comment
    comment.remove(function(err){
      if(err) return res.json(err);

      // decrement the number of comments
      Post.update({_id:post._id}, {$inc:{comments:-1}}, function(err, post){
        if(err) return res.json(err);
        res.redirect('/posts/'+req.params.postId+res.locals.getPostQueryString());
      });
    });
  });
});

module.exports = router;

// private functions

