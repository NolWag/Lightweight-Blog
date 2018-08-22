var express = require("express");
var passport = require("passport");

var User = require("./models/user");
var Post = require("./models/post");

var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.post = req.post;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get("/", function(req, res, next) {
  Post.find()
  .sort({ createdAt: "descending" })
  .exec(function(err, posts) {
    if (err) { return next(err); }
   res.render("index", { posts: posts });
  });
});

// New Post Form
router.get('/post', ensureAuthenticated, function(req, res, next) {
  res.render('post');
});

router.post('/post', function(req, res, next) {
  new Post({title: req.body.title, author: req.body.author, body: req.body.body }).save();
  res.redirect('/');
});

// Display Post
router.get("/posts/:id", function(req, res, next) {
  Post.findOne({ _id: req.params.id }, function(err, post) {
    if (err) { return next(err); }
    if (!post) { return next(404); }
    res.render("posts", { post: post });
  });
});

router.delete("/edit-post/:id", function(req, res, next) {
  Post.deleteOne({ _id: req.params.id }, function(err, post) {
    if(err) { return next(err); }
    if(!post) { return next(404); }
    res.redirect('/');
  });
});


// Edit Post
router.get("/edit-post/:id", ensureAuthenticated, function(req, res, next) {
  Post.findOne({_id: req.params.id }, function(err, post) {
    if(err) { return next(err); }
    if(!post) { return next(404); }
    res.render('edit-post', { post: post});
  })
});

router.post("/edit-post/:id", ensureAuthenticated, function(req, res, next) {
  console.log(req.params)
  Post.update({_id: req.params.id }, {
    title: req.body.title,
    body: req.body.body
  }, function(err, post) {
    if(err) { return next(err); }
    if(!post) { return next(404); }
    res.redirect('/');
  });
});


router.get("/login", function(req, res) {
  res.render("login");
});

router.post("/login", passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {

    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }

    var newUser = new User({
      username: username,
      password: password
    });
    newUser.save(next);

  });
}, passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });
  });
});

router.get("/edit", ensureAuthenticated, function(req, res) {
  res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});

module.exports = router;
