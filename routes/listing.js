const express = require("express");
const router = express.Router();
const multer = require("multer");
const listingController = require("../controllers/listings");
const {storage}=require("../cloudconfig.js")
const upload = multer({storage });


const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, isProjectManagerOrAdmin } = require("../middleware");    
// Listing Validation
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }

    next();
};
router.get("/new", isLoggedIn, isProjectManagerOrAdmin, listingController.rendernewform);

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, isProjectManagerOrAdmin, validateListing, upload.single("listing[image]"), wrapAsync(listingController.createListing));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router;