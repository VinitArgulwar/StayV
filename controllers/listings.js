const Listing = require("../models/listing");

module.exports.index=async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
};

module.exports.rendernewform= (req, res) => {
    
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author" },}).populate("owner") ;

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};
module.exports.createListing= async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id; 
    listing.image={filename,url};
    await listing.save();
    req.flash("success", "Successfully made a new listing!");
    console.log("Session flash:", req.session.flash);
    res.redirect(`/listings`);
};

module.exports.editListing=async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalImageUrl= listing.image.url;
    originalImageUrl.replace("/upload","/upload/h_300,w_250")

    res.render("listings/edit.ejs", { listing, originalImageUrl});
};

module.exports.destroyListing=async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};

module.exports.updateListing=async (req, res) => {
    const { id } = req.params;

    let listing=await Listing.findByIdAndUpdate(id, req.body.listing);
    if(typeof req.file){
     let url=req.file.path;
    let filename=req.file.filename;
      listing.image={filename,url};
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};