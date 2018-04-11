const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const dbUrl = "<MongoDB URL>";
var models = require("./models");

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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

logoutAll();

// app.use((req, res, next)=>{
    // req.session.errs = {};
    // next();
// });
app.get("/", (req, res)=>{
    req.session.err = "";
    res.redirect("login");
});

app.get("/login", (req, res)=>{
    // console.log(req.session);
    if(req.session.login){
        res.redirect("/chat");
    }else{
        res.render("login",{err:req.session.err});
    }
});

app.post("/login",(req,res)=>{
    req.session.errs = {};
    let login = false;
    let username = req.body.username;
    let password = req.body.password;
    models.UserModel.findOne({username: username},(errs, user)=>{
        if(errs){
            console.log("Errors - " + errs);
            res.redirect("/error")
            return;
        }
        if(user != null){
            db_username = user.username;
            db_password = user.password;
            if(db_username == username && db_password == password){
                req.session.login = true;
                req.session.username = db_username;
                user.logged_in = true;
                user.save((err)=>{
                    if(err)
                        console.log(err);
                });
            }else{
                req.session.login = false;
                req.session.err = "Incorrect Password or Username";
            }
        }else{
            req.session.login = false;
            req.body.err = "User not found";
        }
        res.redirect("/login");        
    });    
});

app.get("/signup", (req,res)=>{
    let err = req.session.err;
    res.render("signup",{err:err});
});

app.post("/signup",(req, res)=>{
    let pending_username = req.body.username;
    let pending_password = req.body.password;
    let check_password   = req.body.password_r;
    if(check_password !== pending_password){
        req.session.err = "Passwords don't match";
        console.log("Password error");
        res.redirect("/signup");
        return;
    }
    models.UserModel.findOne({username: pending_username},(errs, user)=>{
        if(errs){
            console.log("Error " + errs);
            redirect("/error");
            return;
        }
        if(user != null){
            
            if( user.username == pending_username){
                req.session.err = "username already exists";
                console.log("Username error");        
                res.redirect("/signup");
                return;
            }
        }
            models.UserModel.create({
            username: pending_username,
            password: pending_password
        }, (errs, user)=>{
            if(errs){
                console.log("Error " + errs);
                redirect("/error");
                return;
            }
            console.log("User craeted! - " + user);
            res.redirect("/login");
        });
    });
});

app.get("/chat", (req,res)=>{
    if(req.session.login){
        models.UserModel.find({},(errs, db_users)=>{
            if(errs){
                console.log(errs);
                res.redirect("/error");
                return;
            }
            let users = [];
            db_users.forEach((user)=>{
                users.push(user.username);
            });
            res.render("index",{username:req.session.username, users:users});
        });
    }else{
        res.redirect("/login");
    }
});

app.post("/chat",(req,res, next)=>{
    type = req.body.type;
    if(type=="logout"){
        req.session.login=false;
        models.UserModel.findOne({username: req.session.username},(errs, user)=>{
            if(errs){
                console.log("Error"  + errs);
                return;
            }else{
                user.logged_in = false;
                user.save((err)=>{
                    if(err)
                        console.log(err);
                });
                res.redirect("/");
            }
        });
        
    }else if(type=="update"){
        models.UserModel.find({logged_in:true},(err,logged_users)=>{
            if(err){
                console.log(err);
                return;
            }
            users = [];
            logged_users.forEach((user)=>{
                users.push(user.username);
            });
            models.MessageModel.find({},(err, messages)=>{
                res.send({test:"test",users:users, messages:messages});
            });
        });
    }else if(type=="message"){
        let content = req.body.message;
        if(content != null){
            let date = new Date().getTime();
            let user = req.session.username;
            models.UserModel.findOne({username:user}, (err,db_user)=>{
                if(err){
                    console.log("Error - " + err);
                    res.send({sent:false});
                    return;
                }
                let message = {
                    message:content,
                    date:date,
                    sender:user
                }; 
                models.MessageModel.create(message,(err, db_message)=>{
                    if(err){
                        console.log("Error")
                        return;
                    }
                    // console.log(db_message.id);
                    // db_user.messages.push(db_message);
                    // db_user.save()
                    res.send({send:true, message: message});
                });
            })
        }
    }

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