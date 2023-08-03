const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
	res.render("users/register");
};

module.exports.register = async (req, res) => {
	try {
		const { email, username, password } = req.body;
		const user = await new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, function (err) {
			if (err) {
				return next(err);
			}
			req.flash("success", "Welcome to YelpCamp!");
			res.redirect("/campgrounds");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("register");
	}
};

module.exports.renderLogin = (req, res) => {
	res.render("users/login");
};

module.exports.login = (req, res) => {
	req.flash("success", "Welcome back!");
	const redirectURL = res.locals.returnTo || "/campgrounds";
	res.redirect(redirectURL); //check sessions (locals, really) to see if there's a saved URL to redirect to.
};

module.exports.logout = (req, res) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		req.flash("success", "You've logged out.");
		res.redirect("/campgrounds");
	});
};
