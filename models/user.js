const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
		//not a validation, but sets up a unique index. Sets off a E11000 Mongoose error saying there's a duplicate.
	}
	//USERNAME (added by passport-local-mongoose)
	//SALT (added by passport-local-mongoose)
	//HASH (password) (added by passport-local-mongoose)
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
