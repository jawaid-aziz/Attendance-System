const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

const startDb = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

const stopDb = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

const clearDb = async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
};

module.exports = { startDb, stopDb, clearDb };
