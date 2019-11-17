const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser"),
	  mongoose   = require("mongoose");
	
<<<<<<< HEAD
mongoose.connect("mongodb://localhost/code_review");
app.use(bodyParser.urlencoded({useNewUrlParser: true})); 
app.set("view engine", "ejs");				  
=======
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine", "ejs");	

// Serve static files
var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));			  
>>>>>>> development
		  
const reviewSchema = new mongoose.Schema({
	name: String,
	image: String,
	author: String,
	review: String	
});

const Review = mongoose.model("Review", reviewSchema);

Review.create(
	{
		title: "Test",
		author: "Dahl",
		review: "It's great!",
		image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
		
	}, (err, review) => {
		if(err) {
			console.log("Error");
		} else {
			console.log("New Review Created");
			console.log(review);
		}
	});


// Route for main page
app.get("/", (req, res) => {
	const reviews = [
		{title: "Noah's Normal Node Nook", author:"Noah", review:"Course about Node", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
		{title: "Shivan's Super Scala Story", author:"Shivan", review:"Scala information", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80"},
		{title: "Dario's Deep Database Dive", author:"Dario", review:"Databases in Depth", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80"}
		]
	res.render("landing",{reviews:reviews});
});		

// route for handeling logic from new review form
app.post("/", (req, res) => {
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