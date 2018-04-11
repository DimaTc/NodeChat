var express = require("express"),
    route   = express.Router(),
    models = require("./models");

route.get("/", (req,res)=>{
    let err = req.session.err;
    res.render("signup",{err:err});
});

route.post("/",(req, res)=>{
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
module.exports = route;