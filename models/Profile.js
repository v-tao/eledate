const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    video: String,
    description: String,
})
module.exports = mongoose.model("Profile", profileSchema)