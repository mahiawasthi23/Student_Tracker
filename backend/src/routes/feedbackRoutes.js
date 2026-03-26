const express = require('express');
const Feedback = require('../models/Feedback');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();


router.get('/count/unseen', requireAuth, async (req, res) => {
  try {
    const studentId = req.auth.userId;
    const unseenCount = await Feedback.countDocuments({
      student: studentId,
      seen: false,
    });

    res.status(200).json({ unseenCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/', requireAuth, async (req, res) => {
  try {
    const studentId = req.auth.userId;

    const feedback = await Feedback.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate('mentor', 'name email')
      .select('-__v');

    if (!feedback) {
      return res.status(404).json({ message: 'No feedback found' });
    }

    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', requireAuth, async (req, res) => {
  const { studentId, text } = req.body;
  const mentorId = req.auth.userId;

  if (!studentId || !text) {
    return res
      .status(400)
      .json({ message: 'studentId and text are required' });
  }

  try {
    const mentor = req.auth.user;

    const feedback = new Feedback({
      student: studentId,
      mentor: mentorId,
      text,
      mentorName: mentor.name,
      campus: mentor.campus,
      seen: false,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/:feedbackId/seen', requireAuth, async (req, res) => {
  const { feedbackId } = req.params;
  const studentId = req.auth.userId;

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.student.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    feedback.seen = true;
    await feedback.save();

    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
