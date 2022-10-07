const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');

const healthRouter = require('./routes/healthRouter');

const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/health', healthRouter);

app.use((req, res) => {
    return res.status(404).end();
});

module.exports = app;
