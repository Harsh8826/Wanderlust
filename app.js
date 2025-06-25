const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch(err=>{
    console.log("Error");
});
async function main(){
    await mongoose.connect(MONGO_URL)
}
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
const sessionOptions = {
    secret:"mySuperSecretCode",
    resave:false,
     saveUninitialized:true,
     cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true
     },
}

// app.get("/",(req,res)=>{
//     res.send("HI! I am root");
// });
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User ({
//         email:"harsh@gmail.com",
//         username:"@harsh"
//     });
//    let registeredUser =  await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


  

// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"MY New Villa",
//         description:'Near the Beach',
//         price:1200,
//         location:"Calangute,Goa",
//         Country:"India"
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Succsessfully updated");
// });

app.all("*",(req,res,next,error)=>{
    next(new ExpressError(404,"Page not Found"));
    console.log(error);
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,()=>{
    console.log("Server is running at port 8080");
})