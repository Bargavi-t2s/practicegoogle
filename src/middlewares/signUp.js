const express=require("express");
const User = require('../models/User');
const bcrypt=require("bcrypt");

    exports.checkUser=function(req,res,next){
      if(req.session.loggedIn){
        res.redirect("/generateUrl");
      }
        else{
          res.render('login' ,{error:''});
        }
    };

    exports.signUp=(req, res, next)=>{
      res.render("signup",{error:""});
    }

    exports.insertUserData = (req,res,next)=> {
      //console.log("inside insert");
      var UserData={
          name: req.body.name,
          email: req.body.username,
          password: req.body.password,
      }
      //console.log(UserData);
      User.create(UserData, function (err, user) {
          if (err) {
            return next(err)
          } else {
            return res.render('login');
          }
        });
      };

      exports.signUpValidation=(req,res,next)=>{
        let count=0;
        req.checkBody('name','Name is required').notEmpty();  
        req.checkBody('username','Email is required').notEmpty();    
        req.checkBody('password','Password is required').notEmpty();
        var errors=req.validationErrors();
        if(errors)
        {
          res.render('signup',{
            error:errors
          });
        }
        else{
            req.checkBody('name',"Invalid name").matches(/^([a-zA-Z\s]+)$/);
            req.checkBody('username',"Invalid email address").matches(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/g);
            req.checkBody('password',"Invalid password").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$^+=!*()@%&]).{8,20}$/g);
            var errors=req.validationErrors();
            if(errors)
            {
              res.render('signup',{
                error:errors
              });
            }
            else{
              next();
            }      
        }
      }
    
exports.validateUser=(req,res,callback)=>{
    User.findOne({ email: req.body.username })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {   
        // res.send("User not found");
        error="User not found !";
        res.render("login", {error:error});
      }
      else
      {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            // if (req.body.password===user.password)
            if(result===true)
             {
              
                req.session.loggedIn=true;
                req.session.user=user;
                req.session.user.email=req.body.username;
                req.session.user.password=req.body.password;
                // res.render("index", {useremail:req.session.user.email});
                res.redirect("/generateUrl");
                return callback(null, user);
            } 
            else {
              error="Incorrect Password !";
              res.render("login", {error:error});
              // return callback(null, user);
            }
          })
      }
    });
}

exports.sessionLogout=(req,res,next)=>{
  req.session.destroy();
  res.render("login", {error:""});
}