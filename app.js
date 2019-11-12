const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser");
	
app.set("view engine", "ejs");				  
		  
app.get("/", (req, res) => {
	res.render("landing");
});					  
					  
	app.get("/signup", (req, res) => {
		res.render("signup");
	});				  
					  
					  
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Code Review is up and running!");
});