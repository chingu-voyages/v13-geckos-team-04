const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser");
	
app.set("view engine", "ejs");				  
		  
// Route for main page
app.get("/", (req, res) => {
	res.render("landing");
});					  
// Route for sign up page			  
app.get("/signup", (req, res) => {
		res.render("signup");
});				  
// Route for login page
app.get("/login", (req, res) => {
		res.render("login");
});	
// Route for about page
app.get("/about", (req, res) => {
		res.render("about");
});
// Route for new review page
app.get("/newreview", (req, res) => {
		res.render("newreview");
});


// Server listening 					  
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Code Review is up and running!");
});