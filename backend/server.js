const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

// CORS configuration
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

// Root route to verify server is running
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const studyRoutes = require('./routes/studyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
  
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri && isProduction) {
      console.error('\n🚨 CRITICAL ERROR: MONGO_URI is not defined in environment variables! 🚨\n');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');
  } catch (err) {
    if (isProduction) {
      console.error('\n🚨 CRITICAL ERROR: Could not connect to your MongoDB Atlas cluster! 🚨');
      console.error('1. Check that your MONGO_URI environment variable in Render is exactly correct.');
      console.error('2. Check that your MongoDB Atlas "Network Access" is set to explicitly allow IP 0.0.0.0/0 (Allow from anywhere) since Render server IPs change dynamically!');
      console.error('Error Details:', err.message, '\n');
      process.exit(1);
    } else {
      console.log('Local MongoDB connection failed. Initializing In-Memory MongoDB Server...');
      try {
        // Dynamically require so it isn't loaded unnecessarily in production
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();
        await mongoose.connect(memUri);
        console.log('MongoDB connected to In-Memory instance');
      } catch (memErr) {
        console.error('Failed to initialize In-Memory Database.', memErr);
        process.exit(1);
      }
    }
  }
};

const PORT = process.env.PORT || 5001;

// Start server ONLY after successful DB connection
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    process.exit(1);
  }
});