const mongoose = require("mongoose");

// This could be expanded upon to allow additional tags to be added
const tagTypeSchema = new mongoose.Schema({
	name: {type: String, require: true}
}, { timestamps: true });

module.exports = mongoose.model("TagType", tagTypeSchema);