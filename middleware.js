const { campgroundSchema, reviewSchema } = require("./schemas"); // for validateCampground and validateReview. They are stored in the same file.
const ExpressError = require("./utils/ExpressError"); //validateCampground
const Campground = require("./models/campground"); //isAuthor & validateCampground
const Review = require("./models/review");

//USER direct to original URL after login
module.exports.storeReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo;
		//stores the pointer-value of the redirect-URL in "res.locals.returnTo".
	}
	next();
};

//USER login checker
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		//store URL user is requesting in sessions.
		req.flash("error", "Please sign in first.");
		return res.redirect("/login");
	}
	next();
};

// CAMPSITE author authorization for editing/deleting
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash("error", "You must be authorized to do this.");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

// CAMPSITE validation
module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body, {
		abortEarly: false
	});
	if (error) {
		const msg = error.details //array of objects
			.map((el) => el.message)
			.join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

// REVIEW validation
module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//REVIEW author authorization for editing/deleting
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params; //review ID, since Express parses query string parameters
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		//is already logged on so we know we can use req.user. Then don't have to deal with "currentUser"
		req.flash("error", "You must be authorized to do this.");
		res.redirect(`/campgrounds/${id}`);
	}
	next();
};
