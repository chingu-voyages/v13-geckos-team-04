var mongoose = require("mongoose");

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

module.exports = mongoose.model("Course", courseSchema);