const Template = require("../models/Template");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlock template
// @route   POST /api/templates/:id/unlock
// @access  Private
exports.unlockTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    if (!template.premium) {
      return res
        .status(400)
        .json({ success: false, message: "Template is not premium" });
    }

    if (user.credits < template.creditCost) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough credits" });
    }

    // Deduct credits
    user.credits -= template.creditCost;
    await user.save();

    // Create transaction
    await Transaction.create({
      user: user._id,
      type: "template_unlock",
      description: `Unlocked template: ${template.name}`,
      credits: -template.creditCost,
    });

    res.status(200).json({
      success: true,
      data: {
        credits: user.credits,
        template,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
