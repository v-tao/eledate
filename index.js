const express = require("express"),
  mongoose = require("mongoose"),
  Profile = require("./models/Profile.js"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  app = express(),
  PORT = 3000;

app.use(require("express-session")({
  secret: "vivian is the coolest person ever",
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set('views', __dirname + '/views');
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://eledate:eledate@cluster0.cgrf8.mongodb.net/eledate?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log("Connected to DB");
}).catch(err => {
	console.log("ERROR", err.message);
});

passport.use(new LocalStrategy(Profile.authenticate()));
passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

app.get("/", (req, res)=> {
  res.render("index", {test: "test"});
});

app.get("/profiles", (req, res) => {
  if (!req.user) {
    res.redirect("/login");
  } else {
    let hiddenProfiles = [req.user.id]
    hiddenProfiles = hiddenProfiles.concat(req.user.yes).concat(req.user.no);
    Profile.find({_id: {$nin: hiddenProfiles}}).exec((err, profiles) => {
      res.render("profiles", {profiles:profiles})
    });
  }
});

app.get("/matches", (req, res) => {
  if (!req.user) {
    res.redirect("/login")
  } else {
    Profile.find({$and: [{yes: req.user.id}, {_id: {$in: req.user.yes}}]}).exec((err, matches) => {
      res.render("matches", {matches: matches});
    });
  }
})

app.post("/signup", (req, res) => {
  let profile = new Profile ({
      username: req.body.username,
      name: req.body.name,
      age: req.body.age,
      video: req.body.video,
      description: req.body.description}
  );
  Profile.register(profile, req.body.password, (err, profile) => {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/profiles");
        })
      }
  })
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/profiles",
	failureRedirect: "/login",
}));

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
});

app.post("/profiles/:id/yes", (req, res) => {
  Profile.findById(req.user.id).exec((err, user) => {
    Profile.findById(req.params.id).exec((err,user2)=> {
      user.yes.push(user2);
      user.save();
      res.redirect("/profiles");
    })
  })
});

app.post("/profiles/:id/no", (req, res) => {
  Profile.findById(req.user.id).exec((err, user) => {
    Profile.findById(req.params.id).exec((err,user2)=> {
      user.no.push(user2);
      user.save();
      res.redirect("/profiles");
    })
  })
});

app.listen(PORT, function () {
  console.log('Running on port : ' + PORT);
});