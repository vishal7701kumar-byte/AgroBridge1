const app = require('../server/server');
const { connectDB } = require('../server/config/db');
const { seedDemoAccounts } = require('../server/services/userService');

let isInitialized = false;
let initPromise = null;

async function ensureDB() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectDB();
        await seedDemoAccounts();
        isInitialized = true;
      } catch (err) {
        console.error('Serverless DB initialization error:', err);
      }
    })();
  }
  await initPromise;
}

module.exports = async (req, res) => {
  await ensureDB();
  return app(req, res);
};
