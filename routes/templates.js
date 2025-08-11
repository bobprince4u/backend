const express = require("express");
const {
  getTemplates,
  getTemplate,
  unlockTemplate,
} = require("../controllers/templateController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(getTemplates);

router.route("/:id").get(getTemplate).post(protect, unlockTemplate);

module.exports = router;
