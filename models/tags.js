var mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
	title: String,
});


module.exports = mongoose.model("Tag", tagSchema);