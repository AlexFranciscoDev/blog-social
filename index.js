require('dotenv').config();
const { connection } = require('./connection');


// Dependencies
const express = require('express');
const cors = require('cors');

console.log('connecting to the database')

// Create the server
const app = express();
const port = process.env.PORT || 3800;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
// Cors sirve para que el frontend pueda hacer peticiones al backend porque
// front esta en vercel y backend esta en render.
app.use(cors({ origin: frontendUrl })); // Solo acepta peticiones de este frontend
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.listen(port, () => {
    console.log('Server listening on port ' + port);
})

// Display images from the backend
app.use("/uploads", express.static("uploads"))

// Import routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

app.get('/test', (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Testing server blogs'
    })
})

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

connection();
