var express = require("express"),
    route   = express.Router(),
    models = require("./models");

route.get("/", (req, res)=>{
    // console.log(req.session);
    if(req.session.login){
        res.redirect("/chat");
    }else{
        res.render("login",{err:req.session.err});
    }
});

route.post("/",(req,res)=>{
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

module.exports = route;