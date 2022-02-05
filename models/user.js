var mongoose=require('mongoose');
var Schema=mongoose.Schema;

passportLocalMongoose=require('passport-local-mongoose');

var User=new Schema({
	admin: {
		type: Boolean,
        default: false
	}
});

User.plugin(passportLocalMongoose); //Adds hash and salt, and additonal methods on user useful for authentication.

var user=mongoose.model('User',User);
module.exports=user;