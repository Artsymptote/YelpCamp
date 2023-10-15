const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res, next) => {
	res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = await new Campground(req.body.campground);
	campground.author = req.user._id;
	campground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.geometry = geoData.body.features[0].geometry;
	await campground.save();
	console.log(campground);
	req.flash("success", "Successfully added a campground!");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id)
		.populate("author")
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		});
	if (!campground) {
		req.flash("error", "Campground Not Found");
		return res.redirect("/campgrounds");
	}
	console.log(campground.images);
	res.render("campgrounds/show", { campground });
};

module.exports.renderCampgroundEditForm = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash("error", "Campground Not Found");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
	const { id } = req.params;
	console.log(req.body);
	const campground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{
			runValidators: true,
		},
	);
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	campground.images.push(...imgs);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	req.flash("success", "Successfully updated the campground!");
	res.redirect(`/campgrounds/${campground._id}`); //uses specifically the ID that is on the campground object, not the one that was pulled from the req.params.
};

module.exports.deleteCampground = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	res.redirect("/campgrounds");
};
