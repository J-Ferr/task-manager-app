const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Rask Manager API is running');
});

// Auth routes
const authRoutes = require('./auth/authRoutes');
app.use('/api/auth', authRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});