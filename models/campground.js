const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; //just allows us to skip writing "mongoose." all the time because we're going to be doing a lot of stuff with mongoose.Schema.
const { cloudinary } = require("../cloudinary");

//* "ImageSchema" subdocument and Image VIRTUALS!
const ImageSchema = new Schema({
	url: String,
	filename: String,
});
//thumbnail virtual
ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});

//Carousel images cropping virtual
ImageSchema.virtual("sizedImage").get(function () {
	return this.url.replace("/upload", "/upload/c_crop");
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String, // Don't do `{ location: { type: String } }`
				enum: ["Point"], // 'location.type' must be 'Point', we're not allowing other options.
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	opts,
);

campgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews, //remember, "doc" is a Campground.
			},
		});
		for (const img of doc.images) {
			await cloudinary.uploader.destroy(img.filename);
		}
	}
});

//Mapbox GeoJSON "properties" property virtual
campgroundSchema.virtual("properties.popUpMarkUp").get(function () {
	return `
	<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
});

module.exports = mongoose.model("Campground", campgroundSchema); //this compiles the model at the same time as exporting it.
