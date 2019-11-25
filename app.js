const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser"),
	  mongoose   = require("mongoose");
	
mongoose.connect("mongodb://localhost:27017/code_review", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine", "ejs");	

// Serve static files
var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));			  

// 		  Mongo Schema for new reviews, eventually break off into seperate folder to req
const reviewSchema = new mongoose.Schema({
	title: String,
	description: String,
	imageUrl: String,
	author: String,
	authorUrl: String,
	courseUrl: String,
	review: String,
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

app.get("/", (req, res) => {
	res.redirect("/courses")
})

// Index - Show all courses
app.get("/courses", (req, res) => {
// 	Get all reviews from DB 
	Review.find({}, (err, allReviews) => {
		if (err) {
			console.log(err)
		} else {
			res.render("landing",{reviews:allReviews});
		}
	});
});		
	
	// New - Route to show form for new courses
app.get("/courses/new", (req, res) => {
		const tags = [{id: 1, title: "CSS"}, 
					{id: 2, title: "JS"}, 
					{id: 3, title: "NodeJS"}, 
					{id: 4, title: "Express"}, 
					{id: 5, title: "MongoDB"}];
		res.render("newreview", {tags: tags});
});
	
app.get("/courses/:id", (req, res) => {
	var id = req.params.id;
	Review.findById(id, (err, course) => {
		if (err) {
			console.log(err);
		} else if (course == null) {
			console.log('No course found with id ' + id);
			return res.redirect("/error");
		} else {
			res.render("show", {course: course});
		}
	});
});

app.post("/search", (req, res) => {
	res.redirect("/courses");
});
		
// Create - Route to handle info from form and add a new course to DB
app.post("/courses", (req, res) => {
// 	Get fields from form and save in newReview variable
	const title = req.body.title;
	const author = req.body.author;
	const description = req.body.description;
	const authorUrl = req.body.authorUrl;
	const reviewTitle = req.body.reviewTitle;
	const reviewDetails = req.body.reviewDetails;
	const price = req.body.price;
	const isFree = req.body.isFree;
	const courseUrl = req.body.courseUrl;	
	const imageUrl = req.body.imageUrl;
// 	Save as new var object
	const newReview = {title: title, author: author, authorUrl: authorUrl, reviewTitle: reviewTitle, reviewDetails: reviewDetails, price: price, isFree: isFree, courseUrl: courseUrl, imageUrl: imageUrl, description: description };
// 	Add to data base
	Review.create(newReview, (err, newlyCreated) => {
		if(err) {
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect("/courses/" + newlyCreated._id);
		}
		
	})
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
app.get("/error", (req, res) => {
		res.render("error");
});



// Server listening 					  
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Code Review is up and running!");
});