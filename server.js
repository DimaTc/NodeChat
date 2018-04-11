const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
var models = require("./models");
var loginRoute  = require("./loginRoute"),
    signupRoute = require("./signupRoute"),
    chatRoute   = require("./chatRoute");

const dbUrl = "<MongoDB URL>";
    
mongoose.connect(dbUrl)
    .then(()=>{console.log("Database Connected!")})
    .catch("Failed to Connect to the Database");


let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    secret:"Testing123",
    resave:true,
    saveUninitialized: false
}));
app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/chat", chatRoute);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

logoutAll();

app.get("/", (req, res)=>{
    req.session.err = "";
    res.redirect("login");
});

app.get("/error", (req,res)=>{
    res.render("error");
});

app.listen(8080);

function logoutAll(){
    models.UserModel.find({}, (err,users)=>{
        users.forEach(user=>{
            user.logged_in = false;
            user.save();
        });
    });
}