const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    goalId: { type: String, required: true, trim: true },
    text: { type: String, trim: true, default: "" },
    hours: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const plannedGoalSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const progressDaySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    goals: {
      type: [plannedGoalSchema],
      default: [],
    },
    reflection: {
      goals: { type: [goalSchema], default: [] },
      challenge: { type: String, trim: true, default: "" },
      extra: {
        text: { type: String, trim: true, default: "" },
        hours: { type: Number, default: 0, min: 0 },
      },
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

progressDaySchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("ProgressDay", progressDaySchema);
