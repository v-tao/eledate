const express = require("express"),
  mongoose = require("mongoose"),
  Profile = require("./models/Profile.js"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  multer = require("multer"),
  cloudinary = require("cloudinary"),
  LocalStrategy = require("passport-local"),
  dotenv = require("dotenv").config(),
  app = express(),
  PORT = 3000;

const videoFilter = (req, file, cb)=> {
  if (!file.originalname.match(/\.(mov|mpeg4|mp4|avi|wmv|mpegps|flv)$/i)) {
     return cb(new Error("Please submit an accepted file type"), "false");
  }
  cb(null, true);
}

const upload = multer({fileFilter: videoFilter});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(require("express-session")({
  secret: process.env.SESSION_SECRET,
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

mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0.cgrf8.mongodb.net/" + process.env.DB_NAME + "?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
  useFindAndModify: false,
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

app.get("/profiles/:id/edit", (req, res) => {
  if(!req.user) {
    res.redirect("/login");
  } else if (!(req.user.id == req.params.id)) {
    res.redirect("/profiles");
  } else {
    Profile.findById(req.params.id).exec((err, profile) => {
      res.render("edit", {profile: profile});
    })
  }
})

app.put("/profiles/:id", (req, res) => {
  if (!req.user) {
    res.redirect("/login");
  } else if (!(req.user.id == req.params.id)) {
    res.redirect("/profiles");
  } else {
    Profile.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      age: req.body.age,
      video: req.body.video,
      description: req.body.description
    }, (err, profile) => {
      res.redirect("/profiles/");
    })
  }
})

app.listen(PORT, function () {
  console.log('Running on port : ' + PORT);
});