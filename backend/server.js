const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    'https://study-tracker-frontend-1qf8.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected successfully to primary URI');
    } catch (err) {
      if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
        console.error('\n🚨 CRITICAL ERROR: Could not connect to your MongoDB Atlas cluster! 🚨');
        console.error('1. Check that your MONGO_URI environment variable in Render is exactly correct.');
        console.error('2. Check that your MongoDB Atlas "Network Access" is set to explicitly allow IP 0.0.0.0/0 (Allow from anywhere) since Render server IPs change dynamically!');
        console.error('Error Details:', err.message, '\n');
      } else {
        console.log('Local MongoDB not found, starting In-Memory MongoDB Server...');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected to In-Memory instance');
      }
    }
  } catch (err) {
    console.error('Failed to initialize DB logic', err);
  }
};

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});