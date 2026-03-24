const express = require("express");

const User = require("../models/User");
const ProgressDay = require("../models/ProgressDay");
const Feedback = require("../models/Feedback");
const AiFeedback = require("../models/AiFeedback");
const { toFrontendState } = require("../utils/stateMapper");
const { buildStreakStats } = require("../utils/streak");

const router = express.Router();

function requireMentor(req, res, next) {
  const role = String(req.auth?.user?.role || "").trim().toLowerCase();
  if (role !== "mentor") {
    return res.status(403).json({ message: "Mentor access required." });
  }

  const campus = String(req.auth?.user?.campus || "").trim();
  if (!campus) {
    return res.status(400).json({ message: "Mentor campus is missing. Complete profile setup first." });
  }

  return next();
}

async function getAuthorizedStudentForMentor(req, res) {
  const campus = String(req.auth.user.campus || "").trim();
  const studentId = String(req.params.studentId || "").trim();

  if (!studentId) {
    res.status(400).json({ message: "Student id is required." });
    return null;
  }

  const student = await User.findById(studentId);
  if (!student) {
    res.status(404).json({ message: "Student not found." });
    return null;
  }

  if (String(student.role || "").trim().toLowerCase() !== "student") {
    res.status(400).json({ message: "Selected user is not a student." });
    return null;
  }

  if (String(student.campus || "").trim() !== campus) {
    res.status(403).json({ message: "You can only view students from your campus." });
    return null;
  }

  return student;
}

router.get("/students", requireMentor, async (req, res) => {
  const campus = String(req.auth.user.campus || "").trim();

  const students = await User.find({
    campus,
    role: "Student",
  })
    .sort({ name: 1, email: 1 })
    .select("name email campus role")
    .lean();

  return res.json({
    campus,
    students: students.map((student) => ({
      id: String(student._id),
      name: student.name,
      email: student.email,
      campus: student.campus || "",
      role: student.role || "",
    })),
  });
});

router.get("/students/:studentId/state", requireMentor, async (req, res) => {
  const student = await getAuthorizedStudentForMentor(req, res);
  if (!student) {
    return;
  }

  const days = await ProgressDay.find({ user: student._id }).sort({ dateKey: 1 }).lean();
  const { goals, reflections } = toFrontendState(days);
  const streak = buildStreakStats(days);

  return res.json({
    user: {
      id: String(student._id),
      name: student.name,
      email: student.email,
      role: student.role || "",
      campus: student.campus || "",
    },
    goals,
    reflections,
    streak,
  });
});

router.get("/students/:studentId/feedback", requireMentor, async (req, res) => {
  const student = await getAuthorizedStudentForMentor(req, res);
  if (!student) {
    return;
  }

  const feedback = await Feedback.find({ student: student._id })
    .sort({ createdAt: -1 })
    .populate("mentor", "name email")
    .select("-__v")
    .lean();

  return res.json(feedback);
});

router.get("/students/:studentId/ai-feedback", requireMentor, async (req, res) => {
  const student = await getAuthorizedStudentForMentor(req, res);
  if (!student) {
    return;
  }

  const aiFeedback = await AiFeedback.find({ user: student._id })
    .sort({ dateKey: -1, createdAt: -1 })
    .select("-__v")
    .lean();

  return res.json(aiFeedback);
});

module.exports = router;