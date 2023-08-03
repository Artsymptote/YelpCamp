const Campground = require("../models/campground");

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res, next) => {
	res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
	const campground = await new Campground(req.body.campground);
	campground.author = req.user._id;
	//WORKED: console.log(res.locals.currentUser);
	await campground.save();
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
	console.log(campground.reviews);
	if (!campground) {
		req.flash("error", "Campground Not Found");
		return res.redirect("/campgrounds");
	}
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
	const campground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{
			runValidators: true,
		},
	);
	req.flash("success", "Successfully updated the campground!");
	res.redirect(`/campgrounds/${campground._id}`); //uses specifically the ID that is on the campground object, not the one that was pulled from the req.params.
};

module.exports.deleteCampground = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	res.redirect("/campgrounds");
};
