const express = require("express");
const {
  getTransactions,
  addCredits,
  addCreditsFromAd,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(protect, getTransactions);

router.route("/purchase").post(protect, addCredits);

router.route("/ad").post(protect, addCreditsFromAd);

module.exports = router;
