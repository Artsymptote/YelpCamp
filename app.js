if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
} //when we're in development, require the "dotenv" package and add them into process.env in the node app.

//* REQUIRES
const express = require("express");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const path = require("path");
const Joi = require("joi");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");

const passport = require("passport");
const LocalStrategy = require("passport-local");

//* CREATE APP
const app = express();

//* Configuration
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
	secret: "thisisabadsecret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

//Passport package configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//^ this line is known as "registering" the strategy in the Passport docs.
//Can have multiple strategies at once. Authenticate was given by passport-local-mongoose.

passport.serializeUser(User.serializeUser());
//Stores user data in the session.
passport.deserializeUser(User.deserializeUser());
//Gets user out of session.

//Response Locals
//Flash Middleware (Must come BEFORE ROUTERS)
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

//Routers
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//* MONGOOSE Set-up & Connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelpcamp");

//* MONGOOSE naming connection & error handling
const db = mongoose.connection; //mongoose.connection is Mongoose's term for its default connection, whichis what we have above.
//no need for useNewUrlPerser, useCreateIndex, or useUnifiedTopology'
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

//* Partials EJS-mate Set-up
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//* REQUIRING DATABASE MODELS
//! Unnecessary now?
const Campground = require("./models/campground");
const Review = require("./models/review");

//* ROUTE HANDLERS
//Home Page
app.get("/", (req, res) => {
	res.render("home");
});

//* 404 ROUTE
//This is not an error handler in itself, it is a catch-all route that redirects the error made here to the custom error handler.
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found; 404 Error", 404));
	//Because this is in next(), the error will get passed directly to the generic app.use error handler just below. It's basically next(e).
});

//* ERROR HANDLERS
//This will take the message and status code from any custom ExpressError instances and "handle" them by sending them to the client. It provides default values if no code/message is available.
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "There has been an error.";
	res.status(statusCode).render("error", { err });
	// next(err); would go to the default Express error handler.
});

//* SERVER CONNECTION
app.listen(3000, () => {
	console.log("Server on port 3000");
});
