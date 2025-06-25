const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapAsync.js");
const passport = require("passport");
// import { saveRedirectUrl } from "../middleware.js";
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});
router.post("/signup",wrapasync(async (req,res)=>{
    try{
         let {username,email,password} = req.body;
    const newUser = new User({email,username,password});
    const registeredUser = await User.register(newUser,password);
    
    req.login(registeredUser,(err)=>{
        if(err){
             return next(err);
        }
         req.flash("success","Welcome to Wanderlust");
     res.redirect("/listings");
    }
);
   
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});
router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    req.flash("Success","Welcome Back to Wanderlust!");
    res.redirect("/listings");
});
router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","You are Logged Out successfully");
        res.redirect("/listings");
})
})
module.exports = router;