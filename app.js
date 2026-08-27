if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}



const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const session = require("express-session");
const {MongoStore}=require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");
const userRouter = require("./routes/user");
const multer = require("multer");
const dburl=process.env.ATLASDB_URL;
const upload = multer({ dest: "uploads/" });


const store=MongoStore.create(
    {
        mongoUrl:dburl,
        crypto:{
            secret:process.env.SECRET,
        },
        touchAfter:24*3600,
    }
);
store.on("error",()=>{
    console.log("Error in mogo sesstion store");
})
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7 ,// 1 week
        httpOnly: true //securty puropse cross scripting attack, it will not allow the cookie to be accessed by the client side script
    }
};
app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.get("/demoUser", async (req, res) => {
    let fakeUser = new User({ email: "demo@example.com",username: "demoUser" });
    await User.register(fakeUser, "password");
    res.redirect("/listings");
});

app.engine("ejs", ejsMate);
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {


      const success=req.flash("success");
    const error=req.flash("error");

    res.locals.success=success;
    res.locals.error=error;
    res.locals.currentUser=req.user;

    next();
});

async function main() {
    await mongoose.connect(dburl);
    console.log("Connected to MongoDB");
}

main().catch(err => console.log(err));


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});