const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser"),
	  mongoose   = require("mongoose");
	
mongoose.connect("mongodb://localhost/code_review");
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine", "ejs");	

// Serve static files
var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));			  

// 		  Mongo Schema for new reviews, eventually break off into seperate folder to req
const reviewSchema = new mongoose.Schema({
	title: String,
	imageUrl: String,
	author: String,
	authorUrl: String,
	courseUrl: String,
	price: Number,
	isFree: Boolean,
	reviewTitle: String,
	reviewDetails: String
});

		



const Review = mongoose.model("Review", reviewSchema);

// Code to Manually add a Review to Database
// Review.create(
// 	{title: "Dario's Deep Database Dive", author:"Dario", review:"Databases in Depth", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80"}, (err, review) => {
// 		if(err) {
// 			console.log("Error");
// 		} else {
// 			console.log("New Review Created");
// 			console.log(review);
// 		}
// 	});


// Route for main page
app.get("/", (req, res) => {
// 	Get all reviews from DB 
	Review.find({}, (err, allReviews) => {
		if (err) {
			console.log(err)
		} else {
			res.render("landing",{reviews:allReviews});
		}
	});
	
	
	// const reviews = [
	// 	{title: "Noah's Normal Node Nook", author:"Noah", review:"Course about Node", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
	// 	{title: "Shivan's Super Scala Story", author:"Shivan", review:"Scala information", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80"},
	// 	{title: "Dario's Deep Database Dive", author:"Dario", review:"Databases in Depth", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80"}
	// 	]
	// 
});		

// route for handeling logic from new review form
app.post("/", (req, res) => {
	let title = req.body.title;
	let author = req.body.author;
	let review = req.body.review;
	let image = req.body.image;
	
	res.redirct("/");
// 	Get data from new review form
// 	Redirect back to the landing page
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
		const tags = [{id: 1, title: "CSS"}, 
					{id: 2, title: "JS"}, 
					{id: 3, title: "NodeJS"}, 
					{id: 4, title: "Express"}, 
					{id: 5, title: "MongoDB"}];
		res.render("newreview", {tags: tags});
});


// Server listening 					  
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Code Review is up and running!");
});