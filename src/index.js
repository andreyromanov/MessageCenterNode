require('dotenv').config();
process.env.NTBA_FIX_319 = 1;

express = require('express');

const isAuthorized = require("./middleware/auth.js");
const bodyParser = require('body-parser');
const app = express();
app.use(isAuthorized);

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.listen(port, () => {
    console.log(`running on port: 3000`);
});

//Import routes
const postsRoute = require('./routes/telegram');
const viberRoutes = require('./routes/viber');

app.use('/telegram', bodyParser.json(), postsRoute);

app.use('/viber', viberRoutes);
