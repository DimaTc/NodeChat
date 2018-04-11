const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: String,
    password: String,
    logged_in: Boolean,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Message"
        }
    ]
}); 

let messageSchema = new mongoose.Schema({
    message: String,
    date: Number,
    sender:String
    // sender:{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User"
    // }/
});

let User = mongoose.model("User", userSchema);
let Message = mongoose.model("Message", messageSchema);


module.exports = {
    UserModel: User,
    MessageModel: Message
};