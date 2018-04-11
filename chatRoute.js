var express = require("express"),
    route   = express.Router(),
    models = require("./models");


    route.get("/", (req,res)=>{
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

route.post("/",(req,res, next)=>{
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

module.exports = route;