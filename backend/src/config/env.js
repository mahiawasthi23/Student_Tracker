const dotenv = require("dotenv");

dotenv.config();

function getEnv(name, fallback) {
  const value = process.env[name] || fallback;
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  PORT: Number(getEnv("PORT", 5000)),
  MONGODB_URI: getEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/students-tracker"),
  JWT_SECRET: getEnv("JWT_SECRET", "students-tracker-dev-secret"),
  GOOGLE_CLIENT_ID: getEnv(
    "GOOGLE_CLIENT_ID",
    "180949238001-e0nk7gc27nrfesumiohd6a3nhb5ej2f2.apps.googleusercontent.com"
  ),
};
