import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

const createCollectionIfNotExists = async (model, collectionName) => {
  const collections = await mongoose.connection.db
    .listCollections({ name: collectionName })
    .toArray();

  if (collections.length > 0) {
    console.log(`Collection already exists: ${collectionName}`);
    return;
  }

  await model.createCollection();
  console.log(`Collection created: ${collectionName}`);
};

const initDb = async () => {
  try {
    await connectDB();

    console.log(`Using database: ${mongoose.connection.name}`);

    await createCollectionIfNotExists(User, 'users');
    await createCollectionIfNotExists(Task, 'tasks');

    await User.init();
    await Task.init();

    console.log('Indexes initialized successfully');
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

initDb();