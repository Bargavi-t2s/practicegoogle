const express=require("express");
const User = require('../models/User');
const bcrypt=require("bcrypt");

    exports.insertUserData = (req,res,next)=> {
    var UserData={
        name: req.body.name,
        email: req.body.username,
        password: req.body.password,
    }

    User.create(UserData, function (err, user) {
        if (err) {
          return next(err)
        } else {
          return res.render('login');
        }
      });
    };

    exports.validateUser=(req,res,callback)=>{
    User.findOne({ email: req.body.username })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {   
        res.send("User not found");
      }
      else
      {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (result === true) {
                res.redirect("/generateUrl");
              return callback(null, user);
            } else {
                res.send("Sorry, you have not logged in correctly.")
            }
          })
      }
    });
};