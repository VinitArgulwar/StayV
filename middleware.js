const Listing = require("./models/listing");
const Review = require("./models/review");
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in to create a new listing!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const isOwner = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (listing && listing.owner.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

const isAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;

    let review = await Review.findById(reviewId);

    if (review && review.author.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to edit this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isOwner,
    isAuthor
};