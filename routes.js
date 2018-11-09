var express = require("express");
var passport = require("passport");
var axios = require("axios");

var User = require("./models/user");
var Post = require("./models/post");

var router = express.Router();

var API = 'b08226d9a3b5dbfaa77c792bb05b6275:2987a4cf861bc27875ce05633d790465';

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

  axios.get('https://' + API + '@goat-gloves-2.myshopify.com/admin/products.json')
  .then(function(response) {
    res.render('index', { response: response.data.products })
  })
  .catch(function(error) {
    console.log(error);
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
router.get("/product/:id", function(req, res, next) {

    axios.get('https://' + API + '@goat-gloves-2.myshopify.com/admin/products/' + req.params.id + '.json')
    .then(function(response) {
      res.render('posts', { response: response.data.product })
    })
    .catch(function(error) {
      console.log(error);
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
router.get("/edit-product/:id", /*ensureAuthenticated,*/ function(req, res, next) {
  axios.get('https://' + API + '@goat-gloves-2.myshopify.com/admin/products/' + req.params.id + '.json')
  .then(function(response) {
    console.log(response)
    res.render('edit-post', { response: response.data.product })
  })
  .catch(function(error) {
    console.log(error);
  });

  // Post.findOne({_id: req.params.id }, function(err, post) {
  //   if(err) { return next(err); }
  //   if(!post) { return next(404); }
  //   res.render('edit-post', { post: post});
  // })
});

router.post("/edit-product/:id", /*ensureAuthenticated,*/ function(req, res, next) {

  axios.put('https://' + API + '@goat-gloves-2.myshopify.com/admin/products/' + req.params.id + '.json', {
      "product": {
        "id": req.params.id,
        "title": req.body.title,
      }
  })
  .then(function(response) {
    //console.log(response.data.product)
    res.redirect('/');
    //res.render('edit-post', { response: response.data.product })
  })
  .catch(function(error) {
    console.log(error);
  });

  // Post.update({_id: req.params.id }, {
  //   title: req.body.title,
  //   body: req.body.body
  // }, function(err, post) {
  //   if(err) { return next(err); }
  //   if(!post) { return next(404); }
  //   res.redirect('/');
  // });
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
