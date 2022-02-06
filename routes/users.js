var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var passport = require('passport');
var authenticate= require('../authenticate');


var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {

  User.register(new User({username:req.body.username}),
  req.body.password,(err,user)=>{
    if(err){
      res.statusCode=500;
      res.setHeader('Content-Type','application/json');
      res.json({err:err});
    }
    else{
      //We will authenticate the user,whose registration was done
      passport.authenticate('local')(req,res,()=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,status: 'Registration Successful!'}); //client can h=just extract this success property to check whether
      })
    }
  })
});


//passport.authenticate automatically adds user property to the body. we can use req.user
router.post('/login',passport.authenticate('local'),(req,res)=>{  //If any error at passport.authenticate, then it will tell the user about the error, else moves on to callback function
  var token = authenticate.getToken({_id: req.user._id}); //we can many things into the web token, but user_id is enough.
  res.statusCode = 200; 
  res.setHeader('Content-Type', 'application/json');
  res.json({success:true,token: token,status: 'You are Successfully logged in!'}); //client can h=just extract this success property to check whether
})


router.get('/logout',(req,res)=>{
  if(req.session){
    req.session.destroy(); //destroys the session at server side
    res.clearCookie('session-id'); //destroys the session at the client side
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});
module.exports = router;
