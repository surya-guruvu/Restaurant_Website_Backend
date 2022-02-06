var passport= require('passport');

var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/user');

var JwtStrategy= require('passport-jwt').Strategy; //Will provide us with a JSON web token based strategy
var ExtractJwt=require('passport-jwt').ExtractJwt; 
var jwt= require('jsonwebtoken');

var config=require('./config');


exports.local=passport.use(new LocalStrategy(User.authenticate())); //LocalStrategy takes a verification function,we are using mongoose pluggin which has a function authenticate.else, we have to write our own user authentication function
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //This two are also added by the pluggin
//For supporting the session, user information must be serialized to be stored with the session information,later, must be deserialized when we get a request

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts={}; //options

opts.jwtFromRequest= ExtractJwt.fromAuthHeaderAsBearerToken(); //This add JW Tokens in all subsesquent requests Authheader.
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false}); //Means we are not using sessions