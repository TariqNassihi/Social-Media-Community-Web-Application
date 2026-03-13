const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../../db.js');

// Route to fetch news articles and save them in the database for the comments featuru
router.get("/", async (req, res) => {
    const newsApiKey = process.env.NEWS_API_KEY; // API key for News API
    const country = 'be'; 
    const language = 'nl'; 

    try {
        const articles = [];

        // Fetch news related to VUB
        const vubNews = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'VUB',
                language: language,
                apiKey: newsApiKey,
            },
        });

        // Fetch news related to students
        const studentNews = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'student',
                language: language,
                apiKey: newsApiKey,
            },
        });

        // Fetch news related to belgium
        const generalNews = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: country,
                category: 'general',
                language: language,
                apiKey: newsApiKey,
            },
        });

        // Combine articles from all fetched news sources
        const newsArticles = [
            ...vubNews.data.articles,
            ...studentNews.data.articles,
            ...generalNews.data.articles,
        ];

        // Limit the number of articles to 50
        const realArtikels = newsArticles.slice(0, 50);
        const articlesWithId = [];

        // Process each article: check if it exists in the database, otherwise insert it
        for (const article of realArtikels) {
            const [existingArticle] = await db.promise().query('SELECT * FROM articles WHERE url = ?', [article.url]);

            let articleId;

            if (existingArticle.length === 0) {
                // Insert new article into the database if it doesn't exist
                const [result] = await db.promise().query(
                    'INSERT INTO articles (url) VALUES (?)',
                    [article.url]
                );
                articleId = result.insertId; // Get the inserted article ID
            } else {
                // Use the existing article ID if it already exists
                articleId = existingArticle[0].id;
            }

            // Add article details with its ID to the response array
            articlesWithId.push({
                id: articleId,
                ...article,
            });
        }

        res.status(200).json(articlesWithId);
    } catch (error) {
        console.error('Error:', error.message); 
        res.status(500).send('Error getting news'); 
    }
});

module.exports = router;
