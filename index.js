const express = require('express');
const axios = require('axios');
const { ytmp3, ytmp4, search } = require('@vreden/youtube_scraper');
const { fbdl, igdl, ttdl } = require('ruhend-scraper');
const app = express();
const port = 3000;

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Main page endpoint
app.get('/', (req, res) => {
    res.send('ignora esto es pa k la api no caiga XD (api para dany)');
});

// Endpoint GET for chat with DeepSeek API
app.get('/chat', async (req, res) => {
    try {
        const { content } = req.query;

        if (!content) {
            return res.status(400).json({ error: 'El parámetro "content" es requerido' });
        }

        const apiToken = process.env.CHUTES_API_TOKEN || 'cpk_578f1b4e3dc94044b8914476a5fcadf5.33e81d8192625cd9952abebf9641b482.zBlvMaFg7sShZhYSVRIPO9bnyGBNRaEx';
        const response = await axios.post(
            'https://llm.chutes.ai/v1/chat/completions',
            {
                model: 'deepseek-ai/DeepSeek-V3-0324',
                messages: [
                    {
                        role: 'user',
                        content
                    }
                ],
                stream: false,
                max_tokens: 1024,
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const apiResponse = response.data;
        const simplifiedResponse = {
            content: apiResponse.choices?.[0]?.message?.content || '',
            reasoning_content: apiResponse.choices?.[0]?.message?.reasoning_content || null,
            author: 'kenn'
        };

        res.json(simplifiedResponse);
    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Function to check if query is a YouTube URL
const isYouTubeURL = (query) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/)?[A-Za-z0-9_-]+(\?.*)?$/;
    return youtubeRegex.test(query);
};

// API endpoint for ytsearch (search videos by name)
app.get('/ytsearch', async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({
            status: false,
            error: 'Search query is required',
            author: 'kenn'
        });
    }

    try {
        const result = await search(query);
        res.json({
            status: result.status,
            results: result.results,
            error: result.status ? null : result.result,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// API endpoint for play (search or download MP3 by name or URL)
app.get('/play', async (req, res) => {
    const { query, quality } = req.query;
    
    if (!query) {
        return res.status(400).json({
            status: false,
            error: 'Search query or URL is required',
            author: 'kenn'
        });
    }

    try {
        let videoUrl;

        if (isYouTubeURL(query)) {
            videoUrl = query;
        } else {
            const searchResult = await search(query);
            if (!searchResult.status || !searchResult.results || searchResult.results.length === 0) {
                return res.status(404).json({
                    status: false,
                    error: 'No videos found for the query',
                    author: 'kenn'
                });
            }
            videoUrl = searchResult.results[0].url;
        }

        const downloadResult = await ytmp3(videoUrl, quality || '128');
        res.json({
            status: downloadResult.status,
            download: downloadResult.download,
            metadata: downloadResult.metadata,
            error: downloadResult.status ? null : downloadResult.result,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// API endpoint for play2 (search or download MP4 by name or URL)
app.get('/play2', async (req, res) => {
    const { query, quality } = req.query;
    
    if (!query) {
        return res.status(400).json({
            status: false,
            error: 'Search query or URL is required',
            author: 'kenn'
        });
    }

    try {
        let videoUrl;

        if (isYouTubeURL(query)) {
            videoUrl = query;
        } else {
            const searchResult = await search(query);
            if (!searchResult.status || !searchResult.results || searchResult.results.length === 0) {
                return res.status(404).json({
                    status: false,
                    error: 'No videos found for the query',
                    author: 'kenn'
                });
            }
            videoUrl = searchResult.results[0].url;
        }

        const downloadResult = await ytmp4(videoUrl, quality || '360');
        res.json({
            status: downloadResult.status,
            download: downloadResult.download,
            metadata: downloadResult.metadata,
            error: downloadResult.status ? null : downloadResult.result,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// API endpoint for TikTok download
app.get('/ttdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            error: 'TikTok URL is required',
            author: 'kenn'
        });
    }

    try {
        const data = await ttdl(url);
        res.json({
            status: true,
            data: {
                title: data.title,
                author: data.author,
                username: data.username,
                published: data.published,
                like: data.like,
                comment: data.comment,
                share: data.share,
                views: data.views,
                bookmark: data.bookmark,
                video: data.video,
                cover: data.cover,
                music: data.music,
                profilePicture: data.profilePicture
            },
            error: null,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// API endpoint for Instagram download
app.get('/igdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            error: 'Instagram URL is required',
            author: 'kenn'
        });
    }

    try {
        const result = await igdl(url);
        const data = await result.data;
        res.json({
            status: true,
            data: data.map(media => ({ url: media.url })),
            error: null,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// API endpoint for Facebook download
app.get('/fbdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            error: 'Facebook URL is required',
            author: 'kenn'
        });
    }

    try {
        const result = await fbdl(url);
        const data = await result.data;
        res.json({
            status: true,
            data: data,
            error: null,
            author: 'kenn'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Server error: ' + error.message,
            author: 'kenn'
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
