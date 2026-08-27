const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const User=require("../models/users");
const nodemailer = require("nodemailer");
const Otp = require("../models/otpschema");
const bcrypt = require("bcrypt");   


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// Verify transporter on startup
transporter.verify()
    .then(() => console.log("SMTP transporter is ready"))
    .catch((err) => console.error("SMTP transporter error:", err.message));

module.exports.signup=async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const email = req.session.email; // Retrieve the email from the session

        if (!email) {
            req.flash("error", "Session expired. Please start the signup process again.");
            return res.redirect("/signup");
        }

        // Check if user already exists with username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
       
        if (existingUser) {
            req.flash("error", "User already exists with this username or email");
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

        // Clean up OTP session data
        delete req.session.email;
        delete req.session.otpVerified;

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

module.exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            req.flash("error", "Please enter an email address.");
            return res.redirect("/signup");
        }

        // Check if email credentials are configured
        if (!process.env.GOOGLE_USER || !process.env.GOOGLE_PASS) {
            console.error("GOOGLE_USER or GOOGLE_PASS environment variables are not set!");
            req.flash("error", "Email service is not configured. Please contact the admin.");
            return res.redirect("/signup");
        }

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

        // Send email with a hard timeout to prevent hanging
        const sendMailPromise = transporter.sendMail({
            from: `"StayV" <${process.env.GOOGLE_USER}>`,
            to: email,
            subject: "OTP Verification",
            text: "Your OTP is: " + otp,
            html: "<b>Your OTP is: " + otp + "</b>",
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email sending timed out")), 15000)
        );

        await Promise.race([sendMailPromise, timeoutPromise]);

        req.flash("success", "OTP sent to your email. Please check your inbox.");
        // Explicitly save session before redirect to prevent data loss
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            return res.redirect("/signup");
        });
    } catch (e) {
        console.error("sendOtp error:", e);
        req.flash("error", e.message || "Something went wrong while sending OTP");
        return res.redirect("/signup");
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.email;

        if (!email) {
            req.flash("error", "Please request an OTP first.");
            return res.redirect("/signup");
        }

        if (!otp) {
            req.flash("error", "Please enter the OTP.");
            return res.redirect("/signup");
        }

        const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!existingOtp) {
            req.flash("error", "OTP has expired or was not found. Please request a new one.");
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
        // Clean up the used OTP
        await Otp.deleteMany({ email });

        req.flash("success", "OTP verified successfully! Please complete your registration.");
        // Explicitly save session before redirect to prevent data loss
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            return res.redirect("/signup");
        });
    } catch (e) {
        console.error("verifyOtp error:", e);
        req.flash("error", e.message || "Something went wrong while verifying OTP");
        return res.redirect("/signup");
    }
};