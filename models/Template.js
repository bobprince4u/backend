const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: [true, "Please add an image URL"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  premium: {
    type: Boolean,
    default: false,
  },
  creditCost: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Template", templateSchema);
