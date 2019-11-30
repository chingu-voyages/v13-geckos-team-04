const express    = require("express"),
	  app        = express(),
	  bodyParser = require("body-parser"),
	  methodOverride = require("method-override"),
	  mongoose   = require("mongoose"); 

require('dotenv/config');
	

// connect to local DB - Do not remove
// mongoose.connect("mongodb://localhost:27017/code_review", {useNewUrlParser: true, useUnifiedTopology: true});
// connect to Cloud DB
// const url = process.env.DATABASE || "mongodb://localhost:27017/code_review"

mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb+srv://nlcopping:" + process.env.MONGO_PASSWORD + "@cluster0-70ykt.mongodb.net/code_review?retryWrites=true&w=majority", {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB");
}).catch(err => {
	console.log("ERROR", err.message);
});


app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine", "ejs");	


// Serve static files
var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));
// Allow PUT & DELETE methods by overriding POST method
app.use(methodOverride("_method"));

// 		  Mongo Schema for new reviews, eventually break off into seperate folder to req
const courseSchema = new mongoose.Schema({
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

const Course = mongoose.model("Course", courseSchema);


app.get("/", (req, res) => {
	res.redirect("/courses");
})

// Index - Show all courses
app.get("/courses", (req, res) => {
// 	Get all reviews from DB 
	Course.find({}, (err, allCourses) => {
		if (err) {
			console.log(err);
		} else {
			res.render("index",{courses:allCourses});
		}
	});
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
	const newCourse = {title: title, author: author, authorUrl: authorUrl, reviewTitle: reviewTitle, reviewDetails: reviewDetails, price: price, isFree: isFree, courseUrl: courseUrl, imageUrl: imageUrl, description: description };
// 	Add to data base
	Course.create(newCourse, (err, newlyCreated) => {
		if(err) {
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect("/courses/" + newlyCreated._id);
		}
		
	})
});
	
	// New - Route to show form for new courses
app.get("/courses/new", (req, res) => {
		const tags = [{id: 1, title: "CSS"}, 
					{id: 2, title: "JS"}, 
					{id: 3, title: "NodeJS"}, 
					{id: 4, title: "Express"}, 
					{id: 5, title: "MongoDB"}];
		res.render("newcourse", {tags: tags});
});
	
// 	Show - Show specific course with additional details by using ID to grab it from the data base

app.get("/courses/:id", (req, res) => {
	var id = req.params.id;
	Course.findById(id, (err, foundCourse) => {
		if (err) {
			console.log(err);
		} else if (foundCourse == null) {
			console.log('No course found with id ' + id);
			return res.redirect("/error");
		} else {
			res.render("show", {foundCourse: foundCourse});
		}
	});
});

// Edit Route - Show form to edit a course. 
app.get("/courses/:id/edit", (req, res) => {
	Course.findById(req.params.id, (err, foundCourse) => {
		if(err) {
			res.render("error");
		} else {
			res.render("edit", {course: foundCourse});
		}
	});
});

// Update Route - Take info from edit form and update DB data
app.put("/courses/:id", (req, res) => {
	Course.findByIdAndUpdate(req.params.id, req.body.course, (err, updatedCourse) => {
		if(err) {
			res.render("error");
		} else {
			res.redirect("/courses/" + req.params.id);
		}
	});
});


app.post("/search", (req, res) => {
	Course.find( {'title': {'$regex': req.body.searchText, '$options' : 'i'} }, (err, courses) => {
		if (err) {
			console.log(err)
		} else {
			res.render("index",{courses: courses, searchFor: req.body.searchText});
		}
	} );
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