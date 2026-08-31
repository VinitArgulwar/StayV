const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const { isLoggedIn, isAuthor, canReview } = require("../middleware");
const reviewcontroller = require("../controllers/reviews");
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }

    next();
};

// Add Review (Not allowed for host role)
router.post("/", isLoggedIn, canReview, validateReview, wrapAsync(reviewcontroller.createReview));

// Delete Review
router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(reviewcontroller.deleteReview));

module.exports = router;