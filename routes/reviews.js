const express = require("express");
const reviews = require("../controllers/reviews");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

// CREATE A REVIEW
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE A REVIEW
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview),
);

module.exports = router;
