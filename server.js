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
const serviceAccount = require('./cinecull-e7ab6-firebase-adminsdk-kzdyy-aa07144fed.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)   
});

// Firebase Auth middleware to intercept and authenticate users
function authenticateRequest(req, res, next) {
    const header = req.headers.authorization;
    if (header !== 'undefined') {
        const token = header.split(' ')[1]; // Bearer <token>

        admin.auth().verifyIdToken(token)
            .then(decodedToken => {
                req.user = decodedToken;
                req.userID = decodedToken.uid;
                next();
            }).catch(error => {
                res.status(403).send('Unauthorized');
            });
    } 
    else {
        res.status(403).send('Unauthorized');
    }
}


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

// Add To Media - When a media is added to a list from search, insert it into the media table if it's not already in there
function addToMedia(media, callback) {
    const sqlCheck = 'SELECT * FROM media WHERE mediaID = ?';
    connection.query(sqlCheck, [media.mediaID], (error, results, fields) => {
        if (error) {
            console.error('Error querying the media table:', error);
            return callback(error, null); // Callback with error
        }
        if (results.length > 0) {
            console.log('- Media already in Media table. Skipping insert. -');
            return callback(null, { message: 'Media already exists', added: false }); // Callback indicating media exists
        } else {
            const sql = 'INSERT INTO media (mediaID, thumbnail, title, mediaType, genre, year, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [media.mediaID, media.thumbnail, media.title, media.mediaType, media.genre, media.year, media.description];
            connection.query(sql, values, (error, results, fields) => {
                if (error) {
                    console.error('Error adding to media table:', error);
                    return callback(error, null); // Callback with error
                }
                console.log(`Media Table: ${media.title} added successfully`);
                callback(null, { message: 'Media added successfully', added: true }); // Callback indicating media inserted
            });
        }
    });
}

// Endpoint to receive media data and insert it
app.post('/addToMedia', authenticateRequest, (req, res) => {
    const media = req.body;
    // addToMedia(media, userID);
    // res.status(200).send('Media inserted successfully');
    addToMedia(media, (error, result) => {
        if (error) {
            console.log('FROM SERVER.JS Error adding to media');
            return res.status(500).send('FROM SERVER.JS Error adding to media');
        }
        console.log('FROM SERVER.JS Added to media successfully');
        return res.status(200).send('FROM SERVER.JS Added to media successfully');
    });
});


function addToWatchlist(userID, media, callback) {
    const mediaID = media.mediaID.toString();
    // First, check if the entry already exists
    const sqlCheck = 'SELECT * FROM watchlist WHERE userID = ? AND mediaID = ?';

    connection.query(sqlCheck, [userID, mediaID], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error checking for duplicates in watchlist:', checkError);
            return callback(checkError, null);
        }

        if (checkResults.length > 0) {
            console.log('- Media already in user watchlist. Skipping insert. -');
            return callback(null, 'Entry already exists in watchlist.');
        } else {
            const insertSql = 'INSERT INTO watchlist (userID, mediaID) VALUES (?, ?)';
            connection.query(insertSql, [userID, mediaID], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Error adding to watchlist:', insertError);
                    return callback(insertError, null);
                }
                console.log(`Watchlist Table: ${userID}, ${mediaID} added successfully`);
                callback(null, insertResults);
            });
        }
    });
}

app.post('/addToWatchlist', authenticateRequest, (req, res) => {
    const media = req.body;
    const userID = req.userID;
    addToWatchlist(userID, media, (error, result) => {
        if (error) {
            console.log('FROM SERVER.JS Error adding to watchlist');
            return res.status(500).send('Error adding to watchlist');
        }
        console.log('FROM SERVER.JS Success adding to watchlist');
        return res.status(200).send('Added to watchlist successfully');
    });
});


function addToWatched(userID, media, callback) {
    const mediaID = media.mediaID.toString();
    // First, check if the entry already exists
    const sqlCheck = 'SELECT * FROM watched WHERE userID = ? AND mediaID = ?';

    connection.query(sqlCheck, [userID, mediaID], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error checking for duplicates in watched:', checkError);
            return callback(checkError, null);
        }

        if (checkResults.length > 0) {
            console.log('- Media already in user watched. Skipping insert. -');
            return callback(null, 'Entry already exists in watched.');
        } else {
            const insertSql = 'INSERT INTO watched (userID, mediaID) VALUES (?, ?)';
            connection.query(insertSql, [userID, mediaID], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Error adding to watched:', insertError);
                    return callback(insertError, null);
                }
                console.log(`Watched Table: ${userID}, ${mediaID} added successfully`);
                callback(null, insertResults);
            });
        }
    });
}

app.post('/addToWatched', authenticateRequest, (req, res) => {
    const media = req.body;
    const userID = req.userID;
    addToWatched(userID, media, (error, result) => {
        if (error) {
            console.log('FROM SERVER.JS Error adding to watched');
            return res.status(500).send('Error adding to watched');
        }
        console.log('FROM SERVER.JS Success adding to watched');
        return res.status(200).send('Added to watched successfully');
    });
});


function removeFromWatchlist(userID, media, callback) {
    const mediaID = media.mediaID.toString();

    const deleteSql = 'DELETE FROM watchlist WHERE userID = ? AND mediaID = ?';

    connection.query(deleteSql, [userID, mediaID], (deleteError, deleteResults) => {
        if (deleteError) {
            console.error('Error removing from watchlist:', deleteError);
            return callback(deleteError, null);
        }

        // Check if the delete operation affected any rows
        if (deleteResults.affectedRows > 0) {
            console.log(`Watchlist Table: Entry for userID ${userID} and mediaID ${mediaID} removed successfully`);
            callback(null, 'Entry removed successfully from watchlist.');
        } else {
            // No entry found with userID and mediaID
            console.log('- No matching entry found in user watchlist. Nothing to remove. -');
            callback(null, 'No matching entry found. Nothing removed.');
        }
    });
}

app.delete('/removeFromWatchlist', authenticateRequest, (req, res) => {
    const mediaID = req.body;
    const userID = req.userID;

    removeFromWatchlist(userID, mediaID, (error, result) => {
        if (error) {
            console.log('FROM SERVER.JS Error removing from watchlist');
            return res.status(500).send('FROM SERVER.JS Error removing from watchlist');
        }
        console.log('FROM SERVER.JS Success removing from watchlist');
        return res.status(200).send(result);
    });
});

function removeFromWatched(userID, media, callback) {
    const mediaID = media.mediaID.toString();

    const deleteSql = 'DELETE FROM watched WHERE userID = ? AND mediaID = ?';

    connection.query(deleteSql, [userID, mediaID], (deleteError, deleteResults) => {
        if (deleteError) {
            console.error('Error removing from watched:', deleteError);
            return callback(deleteError, null);
        }

        // Check if the delete operation affected any rows
        if (deleteResults.affectedRows > 0) {
            console.log(`Watched Table: Entry for userID ${userID} and mediaID ${mediaID} removed successfully`);
            callback(null, 'Entry removed successfully from watched.');
        } else {
            // No entry found with userID and mediaID
            console.log('- No matching entry found in user watched. Nothing to remove. -');
            callback(null, 'No matching entry found. Nothing removed.');
        }
    });
}

app.delete('/removeFromWatched', authenticateRequest, (req, res) => {
    const mediaID = req.body;
    const userID = req.userID;

    removeFromWatched(userID, mediaID, (error, result) => {
        if (error) {
            console.log('FROM SERVER.JS Error removing from watched');
            return res.status(500).send('FROM SERVER.JS Error removing from watched');
        }
        console.log('FROM SERVER.JS Success removing from watched');
        return res.status(200).send(result);
    });
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
  console.log(`Cinecull Express server listening at http://localhost:${port}`);
});