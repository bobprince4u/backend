const Meme = require("../models/Meme");
const { cloudinary } = require("../services/cloudinary");

// @desc    Get all memes
// @route   GET /api/memes
// @access  Public
exports.getMemes = async (req, res) => {
  try {
    const memes = await Meme.find().populate("user", "name avatar");
    res.status(200).json({
      success: true,
      count: memes.length,
      data: memes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single meme
// @route   GET /api/memes/:id
// @access  Public
exports.getMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id).populate(
      "user",
      "name avatar"
    );

    if (!meme) {
      return res
        .status(404)
        .json({ success: false, message: "Meme not found" });
    }

    res.status(200).json({
      success: true,
      data: meme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new meme
// @route   POST /api/memes
// @access  Private
exports.createMeme = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const meme = await Meme.create(req.body);

    res.status(201).json({
      success: true,
      data: meme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload meme image
// @route   POST /api/memes/upload
// @access  Private
exports.uploadMemeImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memes",
    });

    res.status(200).json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like a meme
// @route   PUT /api/memes/:id/like
// @access  Private
exports.likeMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);

    if (!meme) {
      return res
        .status(404)
        .json({ success: false, message: "Meme not found" });
    }

    // Check if user already liked this meme
    const alreadyLiked = meme.likes.some(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Remove like
      meme.likes = meme.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    } else {
      // Add like
      meme.likes.push({ user: req.user.id });
    }

    await meme.save();

    res.status(200).json({
      success: true,
      data: meme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share a meme
// @route   PUT /api/memes/:id/share
// @access  Private
exports.shareMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);

    if (!meme) {
      return res
        .status(404)
        .json({ success: false, message: "Meme not found" });
    }

    meme.shares += 1;
    await meme.save();

    res.status(200).json({
      success: true,
      data: meme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
