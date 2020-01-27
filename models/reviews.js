var mongoose = require("mongoose");

// Review Schema - Comments and ratings for courses
const reviewSchema = new mongoose.Schema({
	id: String,
	courseId: String,
	rating: Number,
	reviewTitle: String,
	reviewDetails: String,
});

module.exports = mongoose.model("Review", reviewSchema);

