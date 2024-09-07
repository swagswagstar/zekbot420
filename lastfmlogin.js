const express = require('express');
const app = express();
const axios = require('axios');
const querystring = require('querystring');

const { lastfmApiKey, lastfmApiSecret } = require('./config.json');
const userLastFmTokens = {}; // Store Last.fm tokens here

app.get('/callback', async (req, res) => {
    const { token, user } = req.query;

    if (token && user) {
        userLastFmTokens[user] = token;
        res.send('Your Last.fm account has been connected!');
    } else {
        res.send('Failed to connect Last.fm account.');
    }
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
