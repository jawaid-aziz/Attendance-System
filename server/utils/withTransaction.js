const mongoose = require("mongoose");

const STANDALONE_MSG = /Transaction numbers are only allowed on a replica set/;

// Run `fn(session)` inside a MongoDB transaction. On a standalone (non
// replica-set) Mongo the session cannot be used, so fall back to running
// `fn(null)` sequentially — the caller's operations must tolerate that.
const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    if (STANDALONE_MSG.test(err && err.message)) {
      console.warn(
        "[tx] Mongo is not a replica set; running without a transaction."
      );
      return fn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = { withTransaction };
