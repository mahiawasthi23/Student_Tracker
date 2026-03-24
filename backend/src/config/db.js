const mongoose = require("mongoose");

async function ensureProgressDayIndexes() {
  const collection = mongoose.connection.collection("progressdays");
  let indexes = [];

  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") {
      throw error;
    }
  }

  const hasLegacyDateKeyUnique = indexes.some(
    (idx) => idx.name === "dateKey_1" && idx.unique
  );

  if (hasLegacyDateKeyUnique) {
    await collection.dropIndex("dateKey_1");
    console.log("Dropped legacy unique index progressdays.dateKey_1");
  }

  await collection.createIndex(
    { user: 1, dateKey: 1 },
    { unique: true, name: "user_1_dateKey_1" }
  );
}

async function connectDatabase(mongoUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  await ensureProgressDayIndexes();
}

module.exports = { connectDatabase };
