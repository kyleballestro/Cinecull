require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const mysql = require('mysql');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));

// Firebase Admin for user authentication server side
const admin = require('firebase-admin');
const serviceAccount = require('/path/to/your-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// --------- MySQL ---------
// Configure MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Connect to MySQL
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

// When a media is added to a list from search, insert it into the media table if it's not already in there
function insertMedia(media) {
    const sqlCheck = 'SELECT * FROM media WHERE mediaID = ?';
    connection.query(sqlCheck, [media.mediaID], (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
        console.log('Media already in Media table. Skipping insert.');
    } 
    else {
        const sql = 'INSERT INTO media (mediaID, thumbnail, title, mediaType, genre, year, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [media.mediaID, media.thumbnail, media.title, media.mediaType, media.genre, media.year, media.description];
        connection.query(sql, values, (error, results, fields) => {
            if (error) throw error;
            console.log(`Media inserted successfully: ${media.title}`);
        });
    }
    });
}

// Endpoint to receive media data and insert it
app.post('/insertMedia', (req, res) => {
    const media = req.body;
    insertMedia(media);
    res.status(200).send('Media inserted successfully');
});



// --------- TMDB API ---------
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