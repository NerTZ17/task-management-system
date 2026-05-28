import mongoose from 'mongoose';
import dns from 'node:dns/promises';

// Force DNS resolver for mongodb+srv on Windows/local development
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    mongoose.set('debug', true);

    mongoose.connection.on('connecting', () => {
      console.log('MongoDB connecting...');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected event fired');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection event error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`MongoDB database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Reason:', error.reason);
    console.error('Stack:', error.stack);

    process.exit(1);
  }
};

export default connectDB;