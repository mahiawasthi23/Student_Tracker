const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    mentorName: String,
    campus: String,
  },
  { timestamps: true }
);

// Compound index for efficient queries
feedbackSchema.index({ student: 1, createdAt: -1 });
feedbackSchema.index({ mentor: 1, createdAt: -1 });

// Auto-delete feedback older than 10 days
feedbackSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 864000, // 10 days in seconds
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
