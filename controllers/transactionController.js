const Transaction = require("../models/Transaction");

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add credits via purchase
// @route   POST /api/transactions/purchase
// @access  Private
exports.addCredits = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const user = req.user;
    user.credits += amount;
    await user.save();

    // Create transaction
    await Transaction.create({
      user: user._id,
      type: "purchase",
      description: `Purchased ${amount} credits`,
      credits: amount,
    });

    res.status(200).json({
      success: true,
      data: {
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add credits via ad watch
// @route   POST /api/transactions/ad
// @access  Private
exports.addCreditsFromAd = async (req, res) => {
  try {
    const user = req.user;
    const credits = 1; // 1 credit per ad

    user.credits += credits;
    await user.save();

    // Create transaction
    await Transaction.create({
      user: user._id,
      type: "ad_watch",
      description: "Watched an ad",
      credits,
    });

    res.status(200).json({
      success: true,
      data: {
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
