const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; //just allows us to skip writing "mongoose." all the time because we're going to be doing a lot of stuff with mongoose.Schema.

const CampgroundSchema = new Schema({
	title: String,
	image: String,
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review"
		}
	]
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews //remember, "doc" is a Campground.
			}
		});
	}
});

module.exports = mongoose.model("Campground", CampgroundSchema); //this compiles the model at the same time as exporting it.
