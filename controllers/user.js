const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const User=require("../models/users");
const nodemailer = require("nodemailer");
const Otp = require("../models/otpschema");
const bcrypt = require("bcrypt");   


const transporter=nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure:false,
    auth:{
        user: process.env.GOOGLE_USER,
         pass:process.env.GOOGLE_PASS,
    },

});

module.exports.signup=async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const email = req.session.email; // Retrieve the email from the session
        // Check if user already exists with username or email
        const existingUser = await User.findOne({
            $or: [{ username }]
        });
       
        if (existingUser) {
            req.flash("error", "User already exists");
            return res.redirect("/login");
        }
        if(!req.session.otpVerified){
            req.flash("error", "Please verify your OTP before signing up.");
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
        res.redirect("/listings");
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

module.exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "User already exists with this email");
            return res.redirect("/signup");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.email = email;
        req.session.otpVerified = false;

        await Otp.deleteMany({ email });

        const hashotp = await bcrypt.hash(otp, 10);
        const newOtp = new Otp({ email, otp: hashotp });
        await newOtp.save();

        await transporter.sendMail({
            from: '"Tester team" <secureshare34@gmail.com>',
            to: email,
            subject: "OTP Verification",
            text: "Your OTP is: " + otp,
            html: "<b>Your OTP is: " + otp + "</b>",
        });

        req.flash("success", "OTP sent to your email. Please check your inbox.");
        return res.redirect("/signup");
    } catch (e) {
        req.flash("error", e.message || "Something went wrong while sending OTP");
        return res.redirect("/signup");
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.session;

        if (!email) {
            req.flash("error", "Please request an OTP first.");
            return res.redirect("/signup");
        }

        const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!existingOtp) {
            req.flash("error", "Invalid OTP. Please try again.");
            return res.redirect("/signup");
        }

        const isOtpValid = await bcrypt.compare(otp, existingOtp.otp);
        if (!isOtpValid) {
            req.flash("error", "Invalid OTP. Please try again.");
            return res.redirect("/signup");
        }

        if (existingOtp.createdAt.getTime() + 5 * 60 * 1000 < Date.now()) {
            req.flash("error", "OTP has expired. Please request a new one.");
            return res.redirect("/signup");
        }

        req.session.otpVerified = true;
        req.flash("success", "OTP verified successfully! Please complete your registration.");
        return res.redirect("/signup");
    } catch (e) {
        req.flash("error", e.message || "Something went wrong while verifying OTP");
        return res.redirect("/signup");
    }
};
    