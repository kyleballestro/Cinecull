require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/searchMedia', async (req, res) => {
    const searchedTitle = req.query.title;
    try{
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(searchedTitle)}`, {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
