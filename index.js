const express = require("express"),
    mongoose = require("mongoose"),
    Profile = require("./models/Profile.js"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    app = express(),
    PORT = 3000;
app.set("view engine", "ejs");
app.set('views', __dirname + '/views');
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res)=> {
    res.render("index", {test: "test"});
})

app.get("/profiles", (req, res) => {
    Profile.find({}).exec((err, profiles) => {
        res.render("profiles", {profiles:profiles})
    })
})

app.post("/profiles/new", (req, res) => {
    console.log(req.body)
    Profile.create({
        name: req.body.name,
        age: req.body.age,
        video: req.body.video,
        description: req.body.description,
    }).catch(err => console.log(err));
    res.redirect("/profiles");
})

mongoose.connect("mongodb+srv://eledate:eledate@cluster0.cgrf8.mongodb.net/eledate?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log("Connected to DB");
}).catch(err => {
	console.log("ERROR", err.message);
});

app.listen(PORT, function () {
    console.log('Running on port : ' + PORT);
  });