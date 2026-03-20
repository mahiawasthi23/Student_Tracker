const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const { GOOGLE_CLIENT_ID, JWT_SECRET } = require("../config/env");
const User = require("../models/User");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}

router.post("/signup", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Account already exists. Please login." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = createToken(user._id);

  return res.status(201).json({ token, user: sanitizeUser(user) });
});

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No account found. Please sign up first." });
  }

  if (!user.passwordHash) {
    return res.status(400).json({ message: "This account uses Google sign-in. Continue with Google." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = createToken(user._id);
  return res.json({ token, user: sanitizeUser(user) });
});

router.post("/forgot-password", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const newPassword = String(req.body?.newPassword || "");

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No account found with this email." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({ message: "Password updated successfully. Please login." });
});

router.post("/google", async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  const mode = String(req.body?.mode || "login").trim();

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = String(payload?.email || "").toLowerCase();
    const name = String(payload?.name || "Student").trim();
    const googleId = String(payload?.sub || "");

    if (!email || !googleId) {
      return res.status(400).json({ message: "Unable to verify Google account." });
    }

    let user = await User.findOne({ email });

    if (mode === "signup") {
      if (user) {
        return res.status(409).json({ message: "Account already exists. Please login with Google." });
      }
      user = await User.create({ email, name, googleId, passwordHash: null });
    } else {
      if (!user) {
        return res.status(404).json({ message: "No account found. Please sign up first." });
      }
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.name && name) {
        user.name = name;
      }
      await user.save();
    }

    const token = createToken(user._id);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (_error) {
    return res.status(401).json({ message: "Google authentication failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: sanitizeUser(req.auth.user) });
});

module.exports = router;
