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


aiFeedbackSchema.index({ user: 1, dateKey: 1 }, { unique: true });


aiFeedbackSchema.index({ user: 1, createdAt: -1 });


aiFeedbackSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 864000,
  }
);

module.exports = mongoose.model('AiFeedback', aiFeedbackSchema);
