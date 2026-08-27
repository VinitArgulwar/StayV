const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const User=require("../models/users");

module.exports.signup=async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists with username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
       
        if (existingUser) {
            req.flash("error", "User already exists with this username or email");
            return res.redirect("/signup");
        }

        const user = new User({
            email: email,
            username
        });
       
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Registered successfully!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message || "Something went wrong");
        res.redirect("/signup");
    }
};



module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back! to StayV");
    res.redirect(   res.locals.redirectUrl|| "/listings"  );

};

module.exports.logout= (req, res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};