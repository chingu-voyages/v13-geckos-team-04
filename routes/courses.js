// add req
var express = require("express"),
	router  = express.Router(),
	Tag     = require("../models/tags"),
	Course  = require("../models/courses"),
	Review  = require("../models/reviews");
	

// Index - Show all courses
router.get("/courses", (req, res) => {
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
			res.render("index",{courses:allCourses, css: css, user: req.user});
		}
	});
});		

// Create - Route to handle info from form and add a new course to DB
router.post("/courses", (req, res) => {
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
router.get("/courses/new", (req, res) => {
	var css = ["header", "footer", "global", "newcourse"];
	let course = {title: "", author: "", description: "", authorUrl: "", price: "", courseUrl: "", imageUrl: "", tags: []};
	res.render("newcourse",{tags: tagList, course: course, action: "/courses", css: css, user: req.user });	
});
	
// 	Show - Show specific course with additional details by using ID to grab it from the data base

router.get("/courses/:id", (req, res) => {
	var id = req.params.id;
	var username = typeof (req.user === "undefined") ? "" : req.user.username; 
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
					res.render("show", {foundCourse, foundReviews, ratingsByStars, css, user: req.user});
				}
			});
		}
	});
});

// Edit Route - Show form to edit a course. 
router.get("/courses/:id/edit", (req, res) => {
	Course.findById(req.params.id, (err, foundCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css, user: req.user});
		} else {
 			var css = ["header", "footer", "global", "newcourse"];
			res.render("newcourse",{tags: tagList, course: foundCourse, action: "/courses/"+foundCourse.id+"?_method=put", css: css, user: req.user });
		}
	});
});

router.post("/newReview", (req, res) => {

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
router.put("/courses/:id", (req, res) => {
	if (req.body.isFree === "on") {
		console.log('setting price to 0');
		req.body.price = 0;
	}
	Course.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css, user: req.user});
		} else {
			console.log(updatedCourse)
			res.redirect("/courses/" + req.params.id);
		}
	});
});

// Delete Route - Find course by ID and delete
router.delete("/courses/:id", (req, res) => {
	Course.findByIdAndRemove(req.params.id, (err, deletedCourse) => {
		if(err) {
			var css = ["header", "footer", "global"];
			res.render("error", {css: css, user: req.user});
		} else {
			res.redirect("/courses")
		}
	});
});

module.exports = router;