const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport"); //is this necessary?
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const { storeReturnTo } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
	.route("/")
	//Go to home page
	.get(catchAsync(campgrounds.index))
	.post(upload.array("image"), (req, res) => {
		console.log(req.body, req.files);
		res.send("success!");
	});
//Send new campground info to DB and redirect to detail page
// .post(
// 	isLoggedIn,
// 	validateCampground,
// 	catchAsync(campgrounds.createCampground),
// )

//Access the FORM for adding a new campground
router.get("/new", storeReturnTo, isLoggedIn, campgrounds.renderNewForm);

router
	.route("/:id")
	//Show details of one campground
	.get(catchAsync(campgrounds.showCampground))
	//Receive data from FORM & UPDATE
	.put(
		isLoggedIn,
		isAuthor,
		validateCampground,
		catchAsync(campgrounds.updateCampground),
	);

//Access the FORM for UPDATING a campground
router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderCampgroundEditForm),
);

// DELETE campground
router.delete(
	"/:id",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.deleteCampground),
);

module.exports = router;
