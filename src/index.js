require('dotenv').config();
process.env.NTBA_FIX_319 = 1;

const express = require('express');
const isAuthorized = require("./middleware/auth.js");
const bodyParser = require('body-parser');
const app = express();

const logger = require('./logger');

app.use(isAuthorized);

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT, () => {
    logger.info(`Server started. Running on port: ${process.env.PORT}`)
});

app.get('/', async (req,res) => {
    res.send('hello world')
})

//Import routes
const postsRoute = require('./routes/telegram');
const viberRoutes = require('./routes/viber');
const apiUatao = require('./routes/api');

app.use('/telegram', bodyParser.json(), postsRoute);
app.use('/viber', viberRoutes);
app.use('/apiUatao', bodyParser.json(), apiUatao);
