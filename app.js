const express = require('express');
const app = express();
const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');

require('dotenv').config()

const port = 4000 || process.env.PORT;
const { API_KEY: apiKey, CHANNEL_ID: channelId } = process.env;

/* Fetch the latest 1st Formations YouTube videos from API */
const fetchYoutubeVideos = async () => {
    try {
        return await axios({
            url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=4`,
            method: 'get'
        });
    } catch (error) {
        console.error(error)
    }
}

/* Scheduled task to fetch the latest 1st Formations YouTube videos and write to json file */
cron.schedule('0 0 * * 5', () => {
    const videos = [];
    const results = fetchYoutubeVideos().then(response => {
        const { items } = response.data;
        if (items) {
            items.forEach(item => {
                const obj = {
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url
                }
                videos.push(obj);
            });
        }
        fs.writeFileSync('results.json', JSON.stringify(videos));
        res.status(200).json({
            message: 'Successfully pulled latest videos.',
            videos: videos
        });
    });
});

/* Read videos data from json file */
app.get('/', (req, res) => {
    const videos = fs.readFileSync('results.json');
    res.status(200).json(JSON.parse(videos));
})

app.listen(port, () => {
    console.log(`Example app listening at port: ${port}`);
})