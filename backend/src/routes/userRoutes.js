const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json({
    user: {
      id: String(req.auth.user._id),
      name: req.auth.user.name,
      email: req.auth.user.email,
    },
  });
});

router.put("/", async (req, res) => {
  const name = (req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  req.auth.user.name = name;
  await req.auth.user.save();

  return res.json({
    user: {
      id: String(req.auth.user._id),
      name: req.auth.user.name,
      email: req.auth.user.email,
    },
  });
});

module.exports = router;
