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
app.use(require("express-session")({
	secret: "Chingu is cool",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



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

// USER Schema - 
const UserSchema = new mongoose.Schema({
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
	password: String
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// 	ROUTES
// ======================


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
			var css = ["header", "footer", "global", "index"];
			res.render("index",{courses:allCourses, css: css});
		}
	});
});		

// Create - Route to handle info from form and add a new course to DB
app.post("/courses", (req, res) => {
// 	Get fields from form and save in newReview variable
	let {title, author, description, authorUrl, price, isFree, courseUrl, imageUrl, tags} = req.body;
	if (isFree === "on") {
		console.log('setting price to 0');
		price = 0;
	}
// 	Save as new var object
	const newCourse = {title, author, description, authorUrl, price, courseUrl, imageUrl, tags, reviewCount: 0, ratingTotal: 0};
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
	
var tagList = [];
Tag.find({}, null, {sort: 'title'}, (err, allTags) => {
	tagList = allTags;
});

// New - Route to show form for new courses
app.get("/courses/new", (req, res) => {
	var css = ["header", "footer", "global", "newcourse"];
	let course = {title: "", author: "", description: "", authorUrl: "", price: "", courseUrl: "", imageUrl: "", tags: []};
	res.render("newcourse",{tags: tagList, course: course, action: "/courses", css: css });	
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
					var css = ["header", "footer", "global", "show"];
					res.render("show", {foundCourse, foundReviews, ratingsByStars, css});
				}
			});
		}
	});
});

// Edit Route - Show form to edit a course. 
app.get("/courses/:id/edit", (req, res) => {
	Course.findById(req.params.id, (err, foundCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css});
		} else {
 			var css = ["header", "footer", "global", "newcourse"];
			res.render("newcourse",{tags: tagList, course: foundCourse, action: "/courses/"+foundCourse.id+"?_method=put", css: css });
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
	if (req.body.isFree === "on") {
		console.log('setting price to 0');
		req.body.price = 0;
	}
	Course.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css});
		} else {
			console.log(updatedCourse)
			res.redirect("/courses/" + req.params.id);
		}
	});
});

// Delete Route - Find course by ID and delete
app.delete("/courses/:id", (req, res) => {
	Course.findByIdAndRemove(req.params.id, (err, deletedCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css});
		} else {
			res.redirect("/courses")
		}
	});
});


app.post("/search", (req, res) => {
	var css = ["header", "footer", "global", "index"];

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
				res.render("index",{courses: courses, searchFor: "Topic: "+req.body.searchText, css: css});
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
				res.render("index",{courses: courses, searchFor: req.body.searchText, css: css});
			}
		});
	}
});

// Show sign up page			  
app.get("/signup", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("signup", {css: css});
});				  
// Handle sign up logic
app.post("/signup", (req, res) => {
	let newUser = {username: req.body.username, email: req.body.email}
	User.register(new User(newUser), req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render("signup");
		} else {
			passport.authenticate("local")(req, res, () => {
				console.log(user);
				res.redirect("/courses");
			});
		}
	});
});


// Route for login page
app.get("/login", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("login", {css: css});
});	
// Route for about page
app.get("/about", (req, res) => {
	var css = ["header", "footer", "global", "about"];
	res.render("about", {css: css});
});

app.get("/error", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("error", {css: css});
});


// Server listening 					  
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Code Review is up and running!");
});