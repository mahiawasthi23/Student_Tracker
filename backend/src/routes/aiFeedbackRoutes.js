const express = require('express');
const AiFeedback = require('../models/AiFeedback');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ''));
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const items = await AiFeedback.find({ user: userId })
      .sort({ dateKey: -1, createdAt: -1 })
      .select('-__v');

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load AI feedback.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { dateKey, feedback } = req.body || {};

    if (!isValidDateKey(dateKey)) {
      return res.status(400).json({ message: 'Valid dateKey (YYYY-MM-DD) is required.' });
    }

    if (!feedback || typeof feedback !== 'object' || Array.isArray(feedback)) {
      return res.status(400).json({ message: 'feedback object is required.' });
    }

    const saved = await AiFeedback.findOneAndUpdate(
      { user: userId, dateKey },
      {
        $set: {
          user: userId,
          dateKey,
          feedback,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to save AI feedback.' });
  }
});

module.exports = router;
