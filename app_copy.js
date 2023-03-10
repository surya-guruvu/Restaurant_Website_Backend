var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');  //already added
var logger = require('morgan');

var session = require('express-session');
var FileStore = require('session-file-store')(session);

var passport=require('passport');
var authenticate=require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Added By me
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

const mongoose = require('mongoose');

const url='mongodb://localhost:27017/conFusion';
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

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());  //If user is logged in 
app.use(passport.session());


app.use('/', indexRouter); //We want this withput authentication
app.use('/users', usersRouter);


/*
function auth(req,res,next){
  //console.log(req.headers);
  //console.log(req.signedCookies);
  console.log(req.session);
 // We could have used any other variable in place of user, like page views(in which case we must keep updating it when ever visited)
  //user field is not present in signed cookie,means the user has not authenticated yet.we expect the user to authenticate himeself.
  if(!req.session.user){  //changed from req.signedCookies.user

    var authHeader= req.headers.authorization;

    if(!authHeader){
      var err=new Error('You are not authenticated');
      res.setHeader('WWW-authenticate','Basic');
      err.status=401;
      next(err);
      return;
    }
    var auth= new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');   //(Basic ..............) in authHeader
    var user=auth[0];
    var pass=auth[1];

    if(user=='admin' && pass=='password'){ //Just for now at this stage,this is default
      //res.cookie('user','admin',{signed:true}); //setting the user name as admin 
      req.session.user='admin';
      next() //authorized and passing to next middle ware.
    }  
    else{
      var err=new Error('You are not authenticated');
      res.setHeader('WWW-authenticate','Basic');
      err.status=401;
      next(err);
      return;
    }
  }
  else{
    if(req.session.user=='admin'){ //changed from req,signedCookies
      next();
    }
    else{  //the cookie is not valid,this generally doesn't happen. We just added for completeness.//This could happen if someone hase tampered the user id
      var err=new Error('You are not authenticated');

      err.status=401;
      next(err);
      return;

    }
  }
}*/
function auth (req, res, next) {
    console.log(req.session);
/*This is a middleware. Now each request that is passed from express server
 has to be passed through this middleware. This middleware fetches the cookie(just an encoded version of sessionId stored on server)
  and decodes it to get the sessionId. The session corresponding to that sessionId is fetched from server 
  and attached to req object as req.session. It gives a feel that we are getting session from client side, 
  but actually it is the work of middleware to attach session object to req object by getting the cookie from the client.
*/
/*
  if(!req.session.user) {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
  }
  else {
    if (req.session.user === 'authenticated') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
*/

// If req.user is presnt then passport has done authentication
  if(!req.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
  }
  else {
    next();
  }
}
  //if user is authorized user then we will allow him to move forward




app.use(auth);

//We want to do authentication right before accessing data.
app.use(express.static(path.join(__dirname, 'public')));




//Added By me
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
