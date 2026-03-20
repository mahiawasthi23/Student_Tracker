const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Session invalid. Please login again." });
    }

    req.auth = {
      userId: String(user._id),
      user,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Session expired or invalid token." });
  }
}

module.exports = { requireAuth };
