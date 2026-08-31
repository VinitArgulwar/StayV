const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, isAdmin } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

const userController = require("../controllers/user");

// Traveler Registration Page
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// Project Manager Registration Page
router.get("/signup/pm", (req, res) => {
    res.render("users/signup_pm.ejs");
});

router.get("/pm-signup", (req, res) => {
    res.redirect("/signup/pm");
});

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}), wrapAsync(userController.login));

router.get("/logout", userController.logout);

// Admin Routes
router.get("/admin", isLoggedIn, isAdmin, wrapAsync(userController.adminDashboard));
router.delete("/admin/users/:userId", isLoggedIn, isAdmin, wrapAsync(userController.deleteUser));

module.exports = router;