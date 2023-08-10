//* Mongoose and Model SetUp
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelpcamp");
const db = mongoose.connection; //mongoose.connection is Mongoose's term for its default connection, whichis what we have above.
//no need for useNewUrlPerser, useCreateIndex, or useUnifiedTopology'
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

// FOLLOWING IMAGE STUFF NOT RELEVANT AS OF LESSON 549.
//* Require axios for Unsplash image
//const axios = require("axios");
//* *** Call unsplash and return small image.
//See the following Q&A:
//https://www.udemy.com/course/the-web-developer-bootcamp/learn/lecture/22291516#questions/16345686
// async function seedImg() {
// 	try {
// 		const resp = await axios.get("https://api.unsplash.com/photos/random", {
// 			params: {
// 				client_id: "pr6QPPVxRQcQp7FUN4xhQ6hqJ2VYSjonxCqDYbA1LZU",
// 				collections: 1114848
// 			}
// 		});
// 		return resp.data.urls.small;
// 	} catch (err) {
// 		console.error(err);
// 	}
// }

//* *** SEEDING CODE ***

const sample = (array) => array[Math.floor(Math.random() * array.length)];

//create function
const seedDB = async () => {
	await Campground.deleteMany({}); // Using await pauses the execution of its surrounding async function until the promise is settled (that is, fulfilled or rejected).
	for (let i = 0; i < 5; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: "64b62b19f04a26e3696332f4",
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url: "https://res.cloudinary.com/dzwbwpng8/image/upload/v1691641308/YelpCamp/r01scgano9kalkccsoup.jpg",
					filename: "YelpCamp/r01scgano9kalkccsoup",
				},
				{
					url: "https://res.cloudinary.com/dzwbwpng8/image/upload/v1691641308/YelpCamp/rbueueajnnxkfrqfdk0u.jpg",
					filename: "YelpCamp/rbueueajnnxkfrqfdk0u",
				},
			],
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			price,
		});
		await camp.save();
	}
};

//Run & close function
//seedDB returns a promise bc it's an async function. Therefore we can use .then() on it and use that to close the connection with Mongo. Just don't want to let it hang open.
seedDB().then(() => {
	db.close();
});
