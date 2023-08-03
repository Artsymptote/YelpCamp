const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	body: String,
	rating: Number
});

//make model AS we
module.exports = mongoose.model("Review", reviewSchema);
