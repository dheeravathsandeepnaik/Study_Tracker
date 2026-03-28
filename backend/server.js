const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // We attempt to connect to the provided URI, but if it fails (e.g. no local MongoDB), we fallback to an in-memory database
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('MongoDB connected to local instance');
    } catch (err) {
      console.log('Local MongoDB not found, starting In-Memory MongoDB Server...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected to In-Memory instance');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});