const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
const profileSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    video: String,
    description: String,
})
profileSchema.plugin(passportLocalMongoose);
profileSchema.methods.validPassword = (password) => {
    return (this.password === password);
}
module.exports = mongoose.model("Profile", profileSchema)