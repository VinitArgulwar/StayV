const Listing = require("./models/listing");
const Review = require("./models/review");

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in!");
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

// Only Project Manager or Admin can create new listings
const isProjectManagerOrAdmin = (req, res, next) => {
    if (req.user.role !== "project_manager" && req.user.role !== "admin") {
        req.flash("error", "Only Project Managers and Admins have permission to create listings!");
        return res.redirect("/listings");
    }
    next();
};

// Project Managers are not allowed to post reviews on any listings
const canReview = (req, res, next) => {
    if (req.user.role === "project_manager") {
        req.flash("error", "Project Managers are not allowed to submit reviews.");
        const { id } = req.params;
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Listing owner OR admin can edit/delete listing
const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    if (req.user.role !== "admin" && listing.owner && listing.owner.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to modify this listing!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Review author OR admin can delete review
const isAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }

    if (req.user.role !== "admin" && review.author && review.author.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to delete this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Admin only middleware
const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "Access denied! Admin privileges required.");
        return res.redirect("/listings");
    }
    next();
};

module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isProjectManagerOrAdmin,
    isHostOrAdmin: isProjectManagerOrAdmin, // backwards compatibility
    canReview,
    isOwner,
    isAuthor,
    isAdmin
};