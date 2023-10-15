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
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const MongoDBStore = require("connect-mongo")(session);

//* CREATE APP
const app = express();

//* Configuration
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
//Setting up for app.use-ing sessionConfig.

//for production:
const dbUrl = process.env.DB_URL;

//for lesson 587:
// const dbUrl = "mongodb://localhost:27017/yelpcamp";

const store = new MongoDBStore({
	url: dbUrl,
	secret: process.env.SECRET,
	touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
	store,
	name: "session",
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//Un-comment-out the "secure" option when you deploy.
		//secure: true,
		maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());

app.use(helmet());
//CSP code setup:
const scriptSrcUrls = [
	"https://kit.fontawesome.com/",
	"https://cdn.jsdelivr.net",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://cdnjs.cloudflare.com/",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://cdn.jsdelivr.net",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
];
const connectSrcUrls = [
	"https://api.mapbox.com/",
	"https://a.tiles.mapbox.com/",
	"https://b.tiles.mapbox.com/",
	"https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"self",
				"blob:",
				"data:",
				`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //put Cloudinary ID there
				"https://images.unsplash.com/",
				"https://source.unsplash.com/",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			childSrc: ["blob:"],
		},
	}),
);

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
	console.log(req.query);
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
//Use this in production:
mongoose.connect(dbUrl);
//Use this in development:
//mongoose.connect("mongodb://localhost:27017/yelpcamp");

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
const port = process.env.PORT || 3000;
app.listen(3000, () => {
	console.log(`Server on port ${port}`);
});
