const User = require("../models/User");
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create welcome bonus transaction
    await Transaction.create({
      user: user._id,
      type: "reward",
      description: "Welcome bonus",
      credits: 10,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Claim daily reward
// @route   POST /api/auth/reward
// @access  Private
exports.claimDailyReward = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const lastClaim = user.lastRewardClaim;

    // Check if already claimed today
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const today = new Date();

      if (
        today.getDate() === lastClaimDate.getDate() &&
        today.getMonth() === lastClaimDate.getMonth() &&
        today.getFullYear() === lastClaimDate.getFullYear()
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Already claimed today" });
      }
    }

    // Calculate streak
    let streak = 1;
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastClaimDate.getDate() === yesterday.getDate() &&
        lastClaimDate.getMonth() === yesterday.getMonth() &&
        lastClaimDate.getFullYear() === yesterday.getFullYear()
      ) {
        streak = user.streak + 1;
      }
    }

    // Calculate reward (1 credit normally, 5 for every 5 days)
    let reward = 1;
    if (streak % 5 === 0) {
      reward = 5;
    }

    // Update user
    user.credits += reward;
    user.streak = streak;
    user.lastRewardClaim = now;
    await user.save();

    // Create transaction
    await Transaction.create({
      user: user._id,
      type: "reward",
      description: `Daily reward (${streak} day streak)`,
      credits: reward,
    });

    res.status(200).json({
      success: true,
      data: {
        credits: user.credits,
        streak: user.streak,
        reward,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
