var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');  //already added
var logger = require('morgan');

var session = require('express-session');
var FileStore = require('session-file-store')(session);


var passport = require('passport');
var authenticate=require('./authenticate');

var config = require('./config');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Added By me
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

const mongoose = require('mongoose');

const url=config.mongoUrl; //So, we are using config as centralised place for configuration.

const connect=mongoose.connect(url);
connect.then((db)=>{
  console.log("connected correctly to the server");
})
.catch((err)=>{
  console.log(err);
})


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-678890-09876-54321')); //secret key,used by our cookie to encrypt the information sent fron source to client


app.use(passport.initialize());  //If user is logged in 
//Removed Sessions for JWT


app.use('/', indexRouter); //We want this withput authentication
app.use('/users', usersRouter);


//removed auth for JWT.

//We want to do authentication right before accessing data.
app.use(express.static(path.join(__dirname, 'public')));




//Added By me
//In this three, we can only keep authentication in put,post,deleted.
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
