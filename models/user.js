var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var User=new Schema({
	username: {
		type:String,
		required:true,
		unique:true
	},
	password: {
		type:String,
		required:true
	},
	admin: {
		type: Boolean,
        default: false
	}
});

var user=mongoose.model('User',User);
module.exports=user;