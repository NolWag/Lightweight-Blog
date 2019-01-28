var express = require("express");
var passport = require("passport");
var axios = require("axios");

var User = require("./models/user");
var Post = require("./models/post");

var multer = require('multer');

var keyPub = process.env.PUBLISHABLE_KEY;
var keySecret = process.env.SECRET_KEY;
var Stripe = require('stripe')(keySecret);

var router = express.Router();

var API = '40cb532ba2293311d7e3464365c136c4:f8f45c4c9b4703c5e4362df210aa7230';

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

  axios.get('https://' + API + '@insta-ecom.myshopify.com/admin/products.json/')
  .then(function(response) {
    //res.render('index', { response: response.data.products })
    //console.log(response.data.products);
    var newData = [];
    for(var i=0;i < response.data.products.length; i++) {
      if(response.data.products[i].tags === "test") {
        //console.log(response.data.products[i], 'here');
        newData.push(response.data.products[i]);
      }
    }
    res.render('index', { response: newData });
  })
  .catch(function(error) {
    console.log(error);
  });
});

// New Post Form
router.get('/add-product', /*ensureAuthenticated*/ function(req, res, next) {
  res.render('post');
});

router.post('/add-product', function(req, res, next) {
  console.log(req.file) // to see what is returned to you
  // axios.post('https://' + API + '@insta-ecom.myshopify.com/admin/products.json/', {
  //     product: {
  //       title: req.body.title,
  //       body_html: req.body.body,
  //       sku: req.body.sku,
  //       price: req.body.price,
  //       weight: req.body.weight,
  //       tags: 'test'
  //     }
  // })
  // .then(function(response) {
  //   res.redirect('/');
  // })
  // .catch(function(error) {
  //   console.log(error);
  // });

});

// Display Post
router.get("/product/:id", function(req, res, next) {

    axios.get('https://' + API + '@insta-ecom.myshopify.com/admin/products/' + req.params.id + '.json')
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
router.get("/edit-product/:id", /*ensureAuthenticated*/ function(req, res, next) {
  axios.get('https://' + API + '@insta-ecom.myshopify.com/admin/products/' + req.params.id + '.json')
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

router.post("/edit-product/:id", /*ensureAuthenticated*/ function(req, res, next) {

  axios.put('https://' + API + '@insta-ecom.myshopify.com/admin/products/' + req.params.id + '.json', {
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
  // Change successRedirect to admin page requiring store name and additional info
  successRedirect: "/signup-info",
  failureRedirect: "/signup",
  failureFlash: true
}));


// Sign-up STAGE 2
router.get("/signup-info", function(req, res) {
  res.render("signup-info");

});

// Sign-up Payment
router.get("/signup-payment", function(req, res) {
  res.render("signup-payment", {keyPub});
});

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
  req.user.store = req.body.store;
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
