const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/users");

module.exports.signup = async (req, res, next) => {
    try {
        const { email, username, password, role } = req.body;

        // Check if user already exists with username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
       
        if (existingUser) {
            req.flash("error", "User with this username or email already exists");
            return res.redirect("/signup");
        }

        let assignedRole = "user";
        if (role === "project_manager" || role === "host" || role === "manager") {
            assignedRole = "project_manager";
        } else if (role === "admin") {
            assignedRole = "admin";
        }

        const user = new User({
            email,
            username,
            role: assignedRole
        });
       
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            const displayRole = assignedRole === "project_manager" ? "PROJECT MANAGER" : assignedRole.toUpperCase();
            req.flash("success", `Welcome to StayV! Registered as ${displayRole}.`);
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message || "Something went wrong");
        res.redirect("/signup");
    }
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};

// Admin Dashboard: View all users, project managers, and listings
module.exports.adminDashboard = async (req, res) => {
    const users = await User.find({});
    const listings = await Listing.find({}).populate("owner");
    const reviews = await Review.find({});

    const userCount = users.filter(u => u.role === "user").length;
    const managerCount = users.filter(u => u.role === "project_manager" || u.role === "host").length;
    const adminCount = users.filter(u => u.role === "admin").length;

    res.render("admin/dashboard.ejs", {
        users,
        listings,
        userCount,
        managerCount,
        adminCount,
        listingCount: listings.length,
        reviewCount: reviews.length
    });
};

// Admin: Delete user/host and cascade delete their listings and reviews
module.exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user._id.toString() === userId.toString()) {
        req.flash("error", "You cannot delete your own admin account!");
        return res.redirect("/admin");
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
        req.flash("error", "User not found!");
        return res.redirect("/admin");
    }

    // Find and delete all listings owned by this user (which will trigger post hook to delete reviews)
    const userListings = await Listing.find({ owner: userId });
    for (let listing of userListings) {
        await Listing.findByIdAndDelete(listing._id);
    }

    // Also delete any reviews written by this user on other listings
    const userReviews = await Review.find({ author: userId });
    for (let review of userReviews) {
        await Listing.updateMany(
            { reviews: review._id },
            { $pull: { reviews: review._id } }
        );
        await Review.findByIdAndDelete(review._id);
    }

    await User.findByIdAndDelete(userId);

    req.flash("success", `Account for ${userToDelete.username} (${userToDelete.role}) and all related data was removed.`);
    res.redirect("/admin");
};