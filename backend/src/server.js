const app = require("./app");
const { connectDatabase } = require("./config/db");
const { MONGODB_URI, PORT } = require("./config/env");

async function start() {
  try {
    await connectDatabase(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

start();
