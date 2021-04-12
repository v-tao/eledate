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

// passport.use(new LocalStrategy(
//   (username, password, done) => {
//     Profile.findOne({username: username}, (err, user) => {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));
passport.use(new LocalStrategy(Profile.authenticate()));
passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
  
// passport.deserializeUser((id, done) => {
//   Profile.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

app.get("/", (req, res)=> {
  res.render("index", {test: "test"});
});

app.get("/profiles", (req, res) => {
  Profile.find({}).exec((err, profiles) => {
      res.render("profiles", {profiles:profiles})
  })
});

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

app.listen(PORT, function () {
  console.log('Running on port : ' + PORT);
});