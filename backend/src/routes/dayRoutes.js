const express = require("express");

const ProgressDay = require("../models/ProgressDay");

const router = express.Router();

function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

async function getOrCreateDay(userId, dateKey) {
  let day = await ProgressDay.findOne({ user: userId, dateKey });
  if (!day) {
    day = await ProgressDay.create({ user: userId, dateKey });
  }
  return day;
}

router.get("/:dateKey", async (req, res) => {
  const { dateKey } = req.params;
  const userId = req.auth.userId;
  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const day = await getOrCreateDay(userId, dateKey);
  return res.json({ day });
});

router.put("/:dateKey", async (req, res) => {
  const { dateKey } = req.params;
  const userId = req.auth.userId;
  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const payload = req.body || {};
  const goals = Array.isArray(payload.goals) ? payload.goals : [];
  const reflection = payload.reflection || {};
  const reflectionGoals = Array.isArray(reflection.goals) ? reflection.goals : [];
  const reflectionChallenge = String(reflection.challenge || "");
  const reflectionExtra = reflection.extra || {};

  const normalizedGoals = goals
    .map((goal) => ({
      id: String(goal?.id || Date.now()),
      text: String(goal?.text || "").trim(),
    }))
    .filter((goal) => goal.text.length > 0);

  const day = await ProgressDay.findOneAndUpdate(
    { user: userId, dateKey },
    {
      $set: {
        user: userId,
        goals: normalizedGoals,
        reflection: {
          goals: reflectionGoals.map((goal) => ({
            goalId: String(goal.goalId),
            text: String(goal.text || ""),
            hours: Number(goal.hours || 0),
          })),
          challenge: reflectionChallenge,
          extra: {
            text: String(reflectionExtra.text || ""),
            hours: Number(reflectionExtra.hours || 0),
          },
        },
        submitted: Boolean(payload.submitted),
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  return res.json({ day });
});

router.post("/:dateKey/goals", async (req, res) => {
  const { dateKey } = req.params;
  const userId = req.auth.userId;
  const text = String(req.body?.text || "").trim();
  const id = String(req.body?.id || Date.now());

  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }
  if (!text) {
    return res.status(400).json({ message: "Goal text is required." });
  }

  const day = await getOrCreateDay(userId, dateKey);
  day.goals.push({ id, text });
  await day.save();

  return res.status(201).json({ day });
});

router.patch("/:dateKey/goals/:goalId", async (req, res) => {
  const { dateKey, goalId } = req.params;
  const userId = req.auth.userId;
  const nextText = String(req.body?.text || "").trim();

  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const day = await getOrCreateDay(userId, dateKey);
  const idx = day.goals.findIndex((goal) => goal.id === goalId);
  if (idx < 0) {
    return res.status(404).json({ message: "Goal not found." });
  }

  if (nextText) {
    day.goals[idx].text = nextText;
  }

  await day.save();
  return res.json({ day });
});

router.delete("/:dateKey/goals/:goalId", async (req, res) => {
  const { dateKey, goalId } = req.params;
  const userId = req.auth.userId;

  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const day = await getOrCreateDay(userId, dateKey);
  day.goals = day.goals.filter((goal) => goal.id !== goalId);
  day.reflection.goals = day.reflection.goals.filter((goal) => goal.goalId !== goalId);
  await day.save();

  return res.status(204).send();
});

router.patch("/:dateKey/reflection", async (req, res) => {
  const { dateKey } = req.params;
  const userId = req.auth.userId;
  const payload = req.body || {};

  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const day = await getOrCreateDay(userId, dateKey);

  if (Array.isArray(payload.goals)) {
    day.reflection.goals = payload.goals.map((goal) => ({
      goalId: String(goal.goalId),
      text: String(goal.text || ""),
      hours: Number(goal.hours || 0),
    }));
  }

  if (payload.extra) {
    day.reflection.extra = {
      text: String(payload.extra.text || ""),
      hours: Number(payload.extra.hours || 0),
    };
  }

  if (typeof payload.submitted === "boolean") {
    day.submitted = payload.submitted;
  }

  await day.save();
  return res.json({ day });
});

router.patch("/:dateKey/submit", async (req, res) => {
  const { dateKey } = req.params;
  const userId = req.auth.userId;
  const submitted = Boolean(req.body?.submitted);

  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ message: "Invalid date key. Use YYYY-MM-DD." });
  }

  const day = await getOrCreateDay(userId, dateKey);
  day.submitted = submitted;
  await day.save();

  return res.json({ day });
});

module.exports = router;
