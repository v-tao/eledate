const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
const profileSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    video: String,
    description: String,
    yes: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    }],
    no: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    }],
    matches: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    }],
})
profileSchema.plugin(passportLocalMongoose);
profileSchema.methods.validPassword = (password) => {
    return (this.password === password);
}
module.exports = mongoose.model("Profile", profileSchema)