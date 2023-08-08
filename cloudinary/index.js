const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary"); //imports the CloudinaryStorage model from multer-storage-cloudinary. We don't have to make our own model, just create an instance of it.

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "YelpCamp",
		allowedFormats: ["jpeg", "png", "jpg"],
	},
});

module.exports = {
	cloudinary,
	storage,
};
