/*
    This file contains the server side code (Node.js) used to handle MySQL database interactions and TMDB API interactions.
*/

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
            })
            .catch(error => {
                res.status(403).send('Unauthorized');
            });
    } 
    else {
        res.status(403).send('Unauthorized');
    }
}


// ------------------ MySQL ------------------
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

// Add a movie/tv show to the Media table if not present
function addToMedia(media, callback) {
    const sqlCheck = 'SELECT * FROM media WHERE mediaID = ?';
    // Check if the Media table already contains the media
    connection.query(sqlCheck, [media.mediaID], (error, results, fields) => {
        if (error) {
            console.error('Error querying the Media table:', error);
            return callback(error, null); // Callback with error
        }
        if (results.length > 0) {
            console.log('- Media already in Media table. Skipping insert. -');
            return callback(null, { message: 'Media already exists', added: false }); // Callback indicating media exists
        } 
        // Media not already in Media table
        else {
            const sql = 'INSERT INTO media (mediaID, thumbnail, title, mediaType, genre, year, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [media.mediaID, media.thumbnail, media.title, media.mediaType, media.genre, media.year, media.description];
            connection.query(sql, values, (error, results, fields) => {
                if (error) {
                    console.error('Error adding to Media table:', error);
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
    addToMedia(media, (error, result) => {
        if (error) {
            console.error('Error adding to Media table:', error);
            return res.status(500).send('Error adding to Media table');
        }
        return res.status(200).send('Added to Media table successfully');
    });
});

// Add a movie/tv show to the Watchlist table if not present
function addToWatchlist(userID, media, callback) {
    const mediaID = media.mediaID.toString();
    
    const sqlCheck = 'SELECT * FROM watchlist WHERE userID = ? AND mediaID = ?';
    // Check if the Watchlist table already contains the media
    connection.query(sqlCheck, [userID, mediaID], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error checking for duplicates in Watchlist table:', checkError);
            return callback(checkError, null);
        }
        if (checkResults.length > 0) {
            console.log('- Media already in Watchlist table for current user. Skipping insert. -');
            return callback(null, 'Entry already exists in watchlist.');
        } 
        // Media not already in Watchlist table
        else {
            const insertSql = 'INSERT INTO watchlist (userID, mediaID) VALUES (?, ?)';
            connection.query(insertSql, [userID, mediaID], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Error adding to Watchlist table:', insertError);
                    return callback(insertError, null);
                }
                console.log(`Watchlist Table: ${userID}, ${mediaID} added successfully`);
                callback(null, insertResults);
            });
        }
    });
}

// Endpoint to receive media data and insert it
app.post('/addToWatchlist', authenticateRequest, (req, res) => {
    const media = req.body;
    const userID = req.userID;
    addToWatchlist(userID, media, (error, result) => {
        if (error) {
            console.error('server.js Error adding to Watchlist table:', error);
            return res.status(500).send('Error adding to Watchlist table');
        }
        return res.status(200).send('Added to Watchlist table successfully');
    });
});

// Add a movie/tv show to the Watched table if not present
function addToWatched(userID, media, callback) {
    const mediaID = media.mediaID.toString();
    
    const sqlCheck = 'SELECT * FROM watched WHERE userID = ? AND mediaID = ?';
    // Check if the Watched table already contains the media
    connection.query(sqlCheck, [userID, mediaID], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error checking for duplicates in Watched table:', checkError);
            return callback(checkError, null);
        }
        if (checkResults.length > 0) {
            console.log('- Media already in Watched table for current user. Skipping insert. -');
            return callback(null, 'Entry already exists in Watched.');
        } 
        // Media not already in Watched table
        else {
            const insertSql = 'INSERT INTO watched (userID, mediaID) VALUES (?, ?)';
            connection.query(insertSql, [userID, mediaID], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Error adding to Watched table:', insertError);
                    return callback(insertError, null);
                }
                console.log(`Watched Table: ${userID}, ${mediaID} added successfully`);
                callback(null, insertResults);
            });
        }
    });
}

// Endpoint to receive media data and insert it
app.post('/addToWatched', authenticateRequest, (req, res) => {
    const media = req.body;
    const userID = req.userID;
    addToWatched(userID, media, (error, result) => {
        if (error) {
            console.error('Error adding to Watched table:', error);
            return res.status(500).send('Error adding to Watched table');
        }
        return res.status(200).send('Added to Watched table successfully');
    });
});

// Remove a movie/tv show from the Watchlist table
function removeFromWatchlist(userID, media, callback) {
    const mediaID = media.mediaID.toString();

    const deleteSql = 'DELETE FROM watchlist WHERE userID = ? AND mediaID = ?';
    connection.query(deleteSql, [userID, mediaID], (deleteError, deleteResults) => {
        if (deleteError) {
            console.error('Error removing from Watchlist table:', deleteError);
            return callback(deleteError, null);
        }
        // Check if the delete operation affected any rows
        if (deleteResults.affectedRows > 0) {
            console.log(`Watchlist Table: Entry for userID ${userID} and mediaID ${mediaID} removed successfully`);
            callback(null, 'Entry removed successfully from watchlist.');
        } 
        else {
            // No entry found with userID and mediaID
            console.log('No matching entry found in user watchlist. Nothing to remove.');
            callback(null, 'No matching entry found. Nothing removed.');
        }
    });
}

// Endpoint to receive media data and delete it
app.delete('/removeFromWatchlist', authenticateRequest, (req, res) => {
    const mediaID = req.body;
    const userID = req.userID;
    removeFromWatchlist(userID, mediaID, (error, result) => {
        if (error) {
            console.error('Error removing from Watchlist table:', error);
            return res.status(500).send('Error removing from Watchlist table');
        }
        return res.status(200).send(result);
    });
});

// Remove a movie/tv show from the Watched table
function removeFromWatched(userID, media, callback) {
    const mediaID = media.mediaID.toString();

    const deleteSql = 'DELETE FROM watched WHERE userID = ? AND mediaID = ?';
    connection.query(deleteSql, [userID, mediaID], (deleteError, deleteResults) => {
        if (deleteError) {
            console.error('Error removing from Watched table:', deleteError);
            return callback(deleteError, null);
        }
        // Check if the delete operation affected any rows
        if (deleteResults.affectedRows > 0) {
            console.log(`Watched Table: Entry for userID ${userID} and mediaID ${mediaID} removed successfully`);
            callback(null, 'Entry removed successfully from watched.');
        } 
        else {
            // No entry found with userID and mediaID
            console.log('No matching entry found in user watched. Nothing to remove.');
            callback(null, 'No matching entry found. Nothing removed.');
        }
    });
}

// Endpoint to receive media data and delete it
app.delete('/removeFromWatched', authenticateRequest, (req, res) => {
    const mediaID = req.body;
    const userID = req.userID;
    removeFromWatched(userID, mediaID, (error, result) => {
        if (error) {
            console.error('Error removing from Watched table:', error);
            return res.status(500).send('Error removing from Watched table');
        }
        return res.status(200).send(result);
    });
});

// Get the current user's watchlist from Watchlist table
function getWatchlist(userID, callback) {
    const getSQL = `
        SELECT m.mediaID, m.thumbnail, m.title, m.mediaType, m.genre, m.year, m.description
        FROM media m
        INNER JOIN watchlist w ON m.mediaID = w.mediaID
        WHERE w.userID = ?;
    `;
    connection.query(getSQL, [userID], (error, results) => {
        if (error) {
            console.error('Error fetching Watchlist details:', error);
            return callback(error, null);
        }
        callback(null, results);
    });
}

// Endpoint to get the user's watchlist
app.get('/getWatchlist', authenticateRequest, (req, res) => {
    const userID = req.userID;

    getWatchlist(userID, (error, results) => {
        if (error) {
            console.error('Error fetching from Watchlist table:', error);
            return res.status(500).send('Error fetching from Watchlist table');
        }
        return res.status(200).json(results);
    });
});

// Get the current user's watched list from Watched table
function getWatched(userID, callback) {
    const getSQL = `
        SELECT m.mediaID, m.thumbnail, m.title, m.mediaType, m.genre, m.year, m.description
        FROM media m
        INNER JOIN watched w ON m.mediaID = w.mediaID
        WHERE w.userID = ?;
    `;
    connection.query(getSQL, [userID], (error, results) => {
        if (error) {
            console.error('Error fetching Watched details:', error);
            return callback(error, null);
        }
        callback(null, results);
    });
}

// Endpoint to get the user's watched list
app.get('/getWatched', authenticateRequest, (req, res) => {
    const userID = req.userID;

    getWatched(userID, (error, results) => {
        if (error) {
            console.error('Error fetching from Watched table:', error);
            return res.status(500).send('Error fetching from Watched table');
        }
        return res.status(200).json(results);
    });
});



// ------------------ TMDB API ------------------
// TMDB API call to get the search results (TV and Movie) from a given title
app.get('/searchMedia', async (req, res) => {
    const searchedTitle = req.query.title;
    const validTitlePattern = /^[a-zA-Z0-9 \-\'\:\!]*$/; 
    if (!searchedTitle || !validTitlePattern.test(searchedTitle)) {
        return res.status(400).send('Invalid input');
    }
    
    try{
        const response = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(searchedTitle)}`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
            }
        });
        res.json(response.data);
    } 
    catch (error){
        console.error('Error calling TMDB API:', error);
        res.status(500).send('Server error');
    }
});

// TMDB API call to get the streaming service options for a media
app.get('/streamingOptions', async (req, res) => {
    const mediaID = req.query.id;
    let mediaType = req.query.type.toLowerCase();

    // Validate mediaID (it should be numeric)
    if (!/^\d+$/.test(mediaID)) {
        return res.status(400).json({ error: 'Invalid media ID' });
    }

    // Validate mediaType (it should be either 'tv show' or 'movie')
    if (mediaType !== 'tv show' && mediaType !== 'movie') {
        return res.status(400).json({ error: 'Invalid media type' });
    }

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
    } 
    catch (error){
        console.error('Error calling TMDB API:', error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({error: 'Data not available'});
        } else {
            res.status(500).json({error: 'Server error'});
        }
    }
});

app.listen(port, () => {
  console.log(`Cinecull Express server listening at http://localhost:${port}`);
});