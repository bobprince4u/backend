const express = require("express");
const {
  getMemes,
  getMeme,
  createMeme,
  uploadMemeImage,
  likeMeme,
  shareMeme,
} = require("../controllers/memeController");
const { protect } = require("../middleware/auth");
const { upload } = require("../services/cloudinary");

const router = express.Router();

router.route("/").get(getMemes).post(protect, createMeme);

router.route("/:id").get(getMeme);

router.route("/:id/like").put(protect, likeMeme);

router.route("/:id/share").put(protect, shareMeme);

router.post("/upload", protect, upload.single("image"), uploadMemeImage);

module.exports = router;
