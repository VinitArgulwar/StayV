const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/user");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", userController.signup);

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",saveRedirectUrl, passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}),userController.login);

router.post("/signup/send-otp", userController.sendOtp);
router.post("/signup/verify-otp", userController.verifyOtp);

router.get("/logout",userController.logout);

module.exports = router;