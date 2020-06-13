const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();


// Port 3000 in development, 8000 for Heroku
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Backend is listening on: ' + port));

app.use(cors());
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(logger('dev'));

// welcome
app.get('/', (req, res) => {
    res.send('Welcome to the server');
});


// Routes
require('./routes/auth.route')(app);
require('./routes/comment.route')(app);
require('./routes/drink.route')(app);
require('./routes/like.route')(app);
require('./routes/post.route')(app);
require('./routes/relation.route')(app);
require('./routes/user.route')(app);
require('./routes/notification.route')(app);
