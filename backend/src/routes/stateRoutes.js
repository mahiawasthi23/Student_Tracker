const express = require("express");

const ProgressDay = require("../models/ProgressDay");
const { toFrontendState } = require("../utils/stateMapper");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.auth.userId;
  const days = await ProgressDay.find({ user: userId }).sort({ dateKey: 1 }).lean();

  const { goals, reflections } = toFrontendState(days);

  res.json({
    user: {
      name: req.auth.user.name,
      email: req.auth.user.email,
    },
    goals,
    reflections,
  });
});

router.put("/", async (req, res) => {
  const payload = req.body || {};
  const userName = (payload.user?.name || "").trim();
  const goals = payload.goals || {};
  const reflections = payload.reflections || {};
  const userId = req.auth.userId;

  if (userName && userName !== req.auth.user.name) {
    req.auth.user.name = userName;
    await req.auth.user.save();
  }

  const allDateKeys = new Set([...Object.keys(goals), ...Object.keys(reflections)]);

  for (const dateKey of allDateKeys) {
    const dayGoals = Array.isArray(goals[dateKey]) ? goals[dateKey] : [];
    const dayReflection = reflections[dateKey] || {};
    const reflectionGoals = Array.isArray(dayReflection.goals) ? dayReflection.goals : [];
    const reflectionExtra = dayReflection.extra || {};

    await ProgressDay.findOneAndUpdate(
      { user: userId, dateKey },
      {
        $set: {
          user: userId,
          goals: dayGoals.map((goal) => ({
            id: String(goal.id),
            text: String(goal.text || ""),
          })),
          reflection: {
            goals: reflectionGoals.map((goal) => ({
              goalId: String(goal.goalId),
              text: String(goal.text || ""),
              hours: Number(goal.hours || 0),
            })),
            extra: {
              text: String(reflectionExtra.text || ""),
              hours: Number(reflectionExtra.hours || 0),
            },
          },
          submitted: Boolean(dayReflection.submitted),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const days = await ProgressDay.find({ user: userId }).sort({ dateKey: 1 }).lean();
  const nextState = toFrontendState(days);

  return res.json({
    user: {
      name: req.auth.user.name,
      email: req.auth.user.email,
    },
    ...nextState,
  });
});

module.exports = router;
