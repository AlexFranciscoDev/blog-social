const { connection } = require('./connection');

// Dependencies
const express = require('express');
const cors = require('cors');

console.log('connecting to the database')

// Create the server
const app = express();
const port = 3800;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.listen(port, () => {
    console.log('Server listening on port ' + port);
})

// Import routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

app.get('/test', (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Testing server blog'
    })
})

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

connection();
