const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
const authRoutes = require('./auth/authRoutes');
app.use('/api/auth', authRoutes);

// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Rask Manager API is running');
});

const subtaskRoutes = require("./routes/subtaskRoutes");
app.use("/api/subtasks", subtaskRoutes);



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});