const express               = require("express"),
	  app                   = express(),
	  bodyParser            = require("body-parser"),
	  methodOverride        = require("method-override"),
	  mongoose              = require("mongoose"),
	  passport              = require("passport"),
	  LocalStratagy         = require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose"),
      User                  = require("./models/users");

require('dotenv/config');
// Require routes - add models to routes files 
var courseRoutes = require("./routes/courses"),
	indexRoutes  = require("./routes/index");
	

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

// Passport Configuration
app.use(require("express-session")({
	secret: "Chingu is cool",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static 
var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));
// Allow PUT & DELETE methods by overriding POST method
app.use(methodOverride("_method"));

passport.use(new LocalStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// 	ROUTES
// ======================

app.use("/", indexRoutes);
app.use("/", courseRoutes);
// Refactor comments using assoisciated data possibly?
// app.use("/course/:id/comments", commentRoutes); 

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
				res.render("index",{courses: courses, searchFor: "Topic: "+req.body.searchText, css: css, user: req.user});
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
				res.render("index",{courses: courses, searchFor: req.body.searchText, css: css, user: req.user});
			}
		});
	}
});

app.get("/error", (req, res) => {
	var css = ["header", "footer", "global"];
	res.render("error", {css: css, user: req.user});
});

// Server listening 					  
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Code Review is up and running!");
});