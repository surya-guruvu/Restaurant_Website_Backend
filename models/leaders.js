const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const leaderSchema=new Schema({
	name: {
		type: String,
		required:true,
		unique:true
	},
	image: {
		type: String,
		required:true,
		unique:true
	},
	designation: {
		type: String,
		required:true,
		unique:true
	},
	abbr: {
		type: String,
		required:true,
		unique:true
	},
	description:{
		type: String,
		required:true
	},
	featured: {
		type: Boolean,
		default:false
	}
});

var Leaders=mongoose.model('leader',leaderSchema);

module.exports=Leaders;