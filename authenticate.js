var passport= require('passport');

var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/user');

exports.local=passport.use(new LocalStrategy(User.authenticate())); //LocalStrategy takes a verification function,we are using mongoose pluggin which has a function authenticate.else, we have to write our own user authentication function
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //This two are also added by the pluggin
//For supporting the session, user information must be serialized to be stored with the session information,later, must be deserialized when we get a request
