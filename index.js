const express = require("express");
const app = express();
const PORT = 3000
app.set("view engine", "ejs");
app.set('views', __dirname + '/views');
app.get("/", (req, res)=> {
    res.render("index", {test: "test"});
})

app.listen(PORT, function () {
    console.log('Running on port : ' + PORT);
  });