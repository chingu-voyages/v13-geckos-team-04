const express               = require("express"),
	  app                   = express(),
	  bodyParser            = require("body-parser"),
	  methodOverride        = require("method-override"),
	  mongoose              = require("mongoose"),
	  passport              = require("passport"),
	  LocalStratagy         = require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose");

require('dotenv/config');
	

// connect to local DB - Do not remove
// mongoose.connect("mongodb://localhost:27017/code_review", {useNewUrlParser: true, useUnifiedTopology: true});
// connect to Cloud DB
// const url = process.env.DATABASE || "mongodb://localhost:27017/code_review"

mongoose.set('useFindAndModify', false);
const {MONGO_USERNAME, MONGO_PASSWORD} = process.env;
mongoose.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0-70ykt.mongodb.net/code_review?retryWrites=true&w=majority`, {
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
	price: Number,
	isFree: Boolean,
	tags: [String],
	reviewCount: Number,
	ratingTotal: Number
});

const Course = mongoose.model("Course", courseSchema);

// Tag Schema - Tech tags for new courses
const tagSchema = new mongoose.Schema({
	title: String,
});
const Tag = mongoose.model("Tag", tagSchema);

// Review Schema - Comments and ratings for courses
const reviewSchema = new mongoose.Schema({
	id: String,
	courseId: String,
	rating: Number,
	reviewTitle: String,
	reviewDetails: String,
});

const Review = mongoose.model("Review", reviewSchema);

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
	res.redirect("/courses");
})

// Index - Show all courses
app.get("/courses", (req, res) => {
// 	Get all courses from DB 
	Course.find({}, (err, allCourses) => {
		if (err) {
			console.log(err);
		} else {
			allCourses.forEach(course => {
				course.rating = Math.floor((course.ratingTotal / course.reviewCount) * 100) / 100;
				if (isNaN(course.rating)) {
					course.rating = 0;
				}
			});
			res.render("index",{courses:allCourses});
		}
	});
});		

// Create - Route to handle info from form and add a new course to DB
app.post("/courses", (req, res) => {
// 	Get fields from form and save in newReview variable
	const {title, author, description, authorUrl, price, isFree, courseUrl, imageUrl, tags} = req.body;
// 	Save as new var object
	const newCourse = {title, author, description, authorUrl, price, isFree, courseUrl, imageUrl, tags, reviewCount: 0, ratingTotal: 0};
// 	Add to data base
	Course.create(newCourse, (err, newlyCreated) => {
		if(err) {
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect("/courses/" + newlyCreated._id);
		}		
	});	
});
	
	// New - Route to show form for new courses
app.get("/courses/new", (req, res) => {
	Tag.find({}, null, {sort: 'title'}, (err, allTags) => {
		if (err) {
			console.log(err);
		} else {
			res.render("newcourse",{tags: allTags});
		}
	});
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
			Review.find({courseId: id}, (err, foundReviews) => {
				if (err) {
					console.log('error: ', err);
				} else {
					foundCourse.rating = Math.round(foundCourse.ratingTotal/foundCourse.reviewCount * 100)/100;
					if (isNaN(foundCourse.rating)) {
						foundCourse.rating = 0;
					}

					let ratingsByStars = [0,0,0,0,0,0];
					foundReviews.forEach(review => {
						ratingsByStars[review.rating]++; 
					});
										
					res.render("show", {foundCourse, foundReviews, ratingsByStars});
				}
			});
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

app.post("/newReview", (req, res) => {

	const newReview = req.body;

	Review.create(newReview, (err, rev) => {
		if (err) {
			console.log('An error occurred: ', err);
		} else {
			console.log('created a new review: ', rev);

			// Update review count and avg rating for the course
			let course = Course.findOne({_id: newReview.courseId});

			Course.findOneAndUpdate(course, {$inc: {reviewCount: 1, ratingTotal: newReview.rating}}, (err, updatedCourse) => {
				if (err) {
					console.log('error updating the course: ', err);
				}
			})

			res.redirect("/courses/" + rev.courseId);
		}
	})

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

// Delete Route - Find course by ID and delete

app.delete("/courses/:id", (req, res) => {
	Course.findByIdAndRemove(req.params.id, (err, deletedCourse) => {
		if(err) {
			res.render("error");
		} else {
			res.redirect("/courses")
		}
	});
});


app.post("/search", (req, res) => {
	if (req.body.searchInField == "tags") {
		Course.find( {tags: req.body.searchText}, (err, courses) => {
			if (err) {
				console.log(err)
			} else {
				courses.forEach(course => {
					course.rating = Math.floor((course.ratingTotal / course.reviewCount) * 100) / 100;
					if (isNaN(course.rating)) {
						course.rating = 0;
					}
				});
				res.render("index",{courses: courses, searchFor: "Topic: "+req.body.searchText});
			}
		} );
	} else {
		Course.find( {'title': {'$regex': req.body.searchText, '$options' : 'i'} }, (err, courses) => {
			if (err) {
				console.log(err)
			} else {
				courses.forEach(course => {
					course.rating = Math.floor((course.ratingTotal / course.reviewCount) * 100) / 100;
					if (isNaN(course.rating)) {
						course.rating = 0;
					}
				});
				res.render("index",{courses: courses, searchFor: req.body.searchText});
			}
		});
	}
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