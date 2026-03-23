const mongoose = require('mongoose');

const aiFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// One AI feedback entry per user per day.
aiFeedbackSchema.index({ user: 1, dateKey: 1 }, { unique: true });

// Fast listing by most recent.
aiFeedbackSchema.index({ user: 1, createdAt: -1 });

// Auto-delete records older than 10 days.
aiFeedbackSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 864000,
  }
);

module.exports = mongoose.model('AiFeedback', aiFeedbackSchema);
