var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var exphbs = require('express-handlebars');

import './public/scss/styles.scss';

var setUpPassport = require('./setuppassport');
var routes = require('./routes');

var app = express();
mongoose.connect('mongodb://localhost:27017/test');
setUpPassport();

app.set('port', process.env.PORT || 3000);

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
/// nolan
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'fudffSER#38d29d8323ER#$R@f9j3r',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);


app.listen(app.get('port'), function() {
  console.log('Server started on port ' + app.get('port'));
});
