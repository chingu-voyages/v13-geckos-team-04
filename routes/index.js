// add requires here including appropriate models
const express  = require("express"),
	  router   = express.Router(),
	  passport = require("passport"),
	  User     = require("../models/users");
	  

router.get("/", (req, res) => {
	res.redirect("/courses");
})

	// ======
	// // Auth Routes
	// =======

// Show sign up page			  
router.get("/signup", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("signup", {css: css, user: req.user});
});				  
// Handle sign up logic
router.post("/signup", (req, res) => {
	let newUser = {username: req.body.username, email: req.body.email}
	User.register(newUser, req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			var css = ["header", "footer", "global"];
			return res.render("signup", {css: css, user: req.user});
		} else {
			passport.authenticate("local")(req, res, () => {
				console.log(user);
				res.redirect("/courses");
			});
		}
	});
});


// Route to show login page
router.get("/login", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("login", {css: css, user: req.user});
});	

// Route to handle logic from log in
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/courses",
		failureRedirect: "/login"
	}), (req, res) => {
});

// Route to Log Out 
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("courses");
});


// Route for about page
router.get("/about", (req, res) => {
	var css = ["header", "footer", "global", "about"];
	res.render("about", {css: css, user: req.user});
});




module.exports = router;