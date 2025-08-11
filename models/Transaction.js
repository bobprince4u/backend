const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["purchase", "reward", "ad_watch", "template_unlock", "streak_bonus"],
    required: [true, "Please add a transaction type"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  credits: {
    type: Number,
    required: [true, "Please add credit amount"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
