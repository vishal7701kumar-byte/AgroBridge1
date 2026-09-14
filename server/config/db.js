const mongoose = require('mongoose');

let isConnected = false;
let useMemoryFallback = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrobridge';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Local MongoDB daemon not reachable at ${mongoURI}`);
    console.log(`🚀 Activating High-Performance In-Memory Mongoose-Compatible Store for AgroBridge`);
    useMemoryFallback = true;
    return false;
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  useMemoryFallback: () => useMemoryFallback
};
