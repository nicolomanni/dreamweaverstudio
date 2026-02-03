import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToMongo(uri: string): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('MongoDB connection string is required.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  return connectionPromise;
}

export async function disconnectFromMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
}
