const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
    name: String,
    age: Number,
    video: String,
    description: String,
})
module.exports = mongoose.model("Profile", profileSchema)