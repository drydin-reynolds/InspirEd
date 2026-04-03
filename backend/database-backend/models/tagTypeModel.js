const mongoose = require("mongoose");

const tagTypeSchema = new mongoose.Schema({
	name: {type: String, require: true}
}, { timestamps: true });

module.exports = mongoose.model("TagType", tagTypeSchema);