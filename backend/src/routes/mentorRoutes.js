const express = require("express");

const User = require("../models/User");
const ProgressDay = require("../models/ProgressDay");
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
  const campus = String(req.auth.user.campus || "").trim();
  const studentId = String(req.params.studentId || "").trim();

  if (!studentId) {
    return res.status(400).json({ message: "Student id is required." });
  }

  const student = await User.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  if (String(student.role || "").trim().toLowerCase() !== "student") {
    return res.status(400).json({ message: "Selected user is not a student." });
  }

  if (String(student.campus || "").trim() !== campus) {
    return res.status(403).json({ message: "You can only view students from your campus." });
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

module.exports = router;