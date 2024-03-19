require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

// TMDB API call to get the search results (TV and Movie) from a given title
app.get('/searchMedia', async (req, res) => {
    const searchedTitle = req.query.title;
    
    try{
        const response = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(searchedTitle)}`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
            }
        });
        res.json(response.data);
    } catch (error){
        console.error('Error calling TMDB API:', error);
        res.status(500).send('Server error');
    }
});

// TMDB API call to get the streaming service options for a media
app.get('/streamingOptions', async (req, res) => {
    const mediaID = req.query.id;
    let mediaType = req.query.type;
    if (mediaType === 'tv show') mediaType = 'tv';

    try{
        const response = await axios.get(`https://api.themoviedb.org/3/${encodeURIComponent(mediaType)}/${encodeURIComponent(mediaID)}/watch/providers?api_key=${process.env.TMDB_API_KEY}`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
            }
        });
        const usProviders = response.data.results?.US || {};
        res.json(usProviders);
    } catch (error){
        console.error('Error calling TMDB API:', error);
        res.status(500).json({error: 'Server error'});
    }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});