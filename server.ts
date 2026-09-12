import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to decode HTML entities returned by JioSaavn
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// Helper to upgrade JioSaavn artwork to 500x500 high resolution
function upgradeJioSaavnImage(imageUrl: string | undefined): string {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
  }
  return imageUrl
    .replace('50x50.jpg', '500x500.jpg')
    .replace('150x150.jpg', '500x500.jpg')
    .replace('http://', 'https://');
}

// 1. Search JioSaavn Songs API
app.get('/api/jiosaavn/search', async (req, res) => {
  try {
    const query = (req.query.query as string) || '';
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const page = parseInt((req.query.page as string) || '1', 10);

    if (!query.trim()) {
      return res.json({ success: true, results: [] });
    }

    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&includeMetaTags=1&q=${encodeURIComponent(
      query.trim()
    )}&p=${page}&n=${limit}`;

    const response = await fetch(saavnUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`JioSaavn API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawResults = data.results || [];

    const tracks = rawResults
      .filter((song: any) => song && (song.encrypted_media_url || song.media_preview_url))
      .map((song: any) => {
        const title = decodeHtmlEntities(song.song || song.title || 'Unknown Song');
        const artist = decodeHtmlEntities(
          song.primary_artists || song.singers || song.music || 'Unknown Artist'
        );
        const album = decodeHtmlEntities(song.album || 'Single');
        const duration = parseInt(song.duration || '210', 10);
        const artworkUrl = upgradeJioSaavnImage(song.image);

        // Stream URL pointing to our stream resolver endpoint
        const streamUrl = song.encrypted_media_url
          ? `/api/jiosaavn/stream?url=${encodeURIComponent(song.encrypted_media_url)}`
          : song.media_preview_url;

        return {
          id: `jiosaavn-${song.id}`,
          title,
          artist,
          album,
          duration: isNaN(duration) || duration <= 0 ? 180 : duration,
          artworkUrl,
          streamUrl,
          encryptedMediaUrl: song.encrypted_media_url,
          genre: song.language ? `${song.language.toUpperCase()} • JioSaavn` : 'JioSaavn Hit',
          source: 'jiosaavn',
          playCount: parseInt(song.play_count || '150000', 10),
          releaseYear: song.year || 2024,
        };
      });

    res.json({ success: true, results: tracks });
  } catch (error: any) {
    console.error('JioSaavn search error:', error.message);
    res.status(500).json({ success: false, error: error.message, results: [] });
  }
});

// 2. JioSaavn Trending / Top Hits API
app.get('/api/jiosaavn/trending', async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '24', 10);
    // Fetch top trending Hindi and Global hits on JioSaavn
    const queries = ['trending hindi', 'top bollywood', 'latest punjabi'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&includeMetaTags=1&q=${encodeURIComponent(
      randomQuery
    )}&p=1&n=${limit}`;

    const response = await fetch(saavnUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`JioSaavn trending error status ${response.status}`);
    }

    const data = await response.json();
    const rawResults = data.results || [];

    const tracks = rawResults
      .filter((song: any) => song && (song.encrypted_media_url || song.media_preview_url))
      .map((song: any) => {
        const title = decodeHtmlEntities(song.song || song.title || 'Unknown Song');
        const artist = decodeHtmlEntities(
          song.primary_artists || song.singers || song.music || 'Unknown Artist'
        );
        const album = decodeHtmlEntities(song.album || 'Single');
        const duration = parseInt(song.duration || '210', 10);
        const artworkUrl = upgradeJioSaavnImage(song.image);

        const streamUrl = song.encrypted_media_url
          ? `/api/jiosaavn/stream?url=${encodeURIComponent(song.encrypted_media_url)}`
          : song.media_preview_url;

        return {
          id: `jiosaavn-${song.id}`,
          title,
          artist,
          album,
          duration: isNaN(duration) || duration <= 0 ? 180 : duration,
          artworkUrl,
          streamUrl,
          encryptedMediaUrl: song.encrypted_media_url,
          genre: song.language ? `${song.language.toUpperCase()} • JioSaavn` : 'JioSaavn Trending',
          source: 'jiosaavn',
          playCount: parseInt(song.play_count || '250000', 10),
          releaseYear: song.year || 2024,
        };
      });

    res.json({ success: true, results: tracks });
  } catch (error: any) {
    console.error('JioSaavn trending error:', error.message);
    res.status(500).json({ success: false, error: error.message, results: [] });
  }
});

// In-memory cache for decrypted JioSaavn media auth URLs to maximize performance
const streamUrlCache = new Map<string, { url: string; expiresAt: number }>();

// 3. JioSaavn Stream Resolver Endpoint
app.get('/api/jiosaavn/stream', async (req, res) => {
  try {
    const encUrl = req.query.url as string;
    const bitrate = (req.query.bitrate as string) || '320';
    const jsonMode = req.query.json === 'true';

    if (!encUrl) {
      return res.status(400).json({ error: 'Missing encrypted url parameter' });
    }

    // Check cache
    const cacheKey = `${encUrl}_${bitrate}`;
    const cached = streamUrlCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      if (jsonMode) {
        return res.json({ streamUrl: cached.url });
      }
      return res.redirect(302, cached.url);
    }

    const tokenUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&_format=json&_marker=0&cc=in&includeMetaTags=1&url=${encodeURIComponent(
      encUrl
    )}&bitrate=${bitrate}`;

    const response = await fetch(tokenUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Auth token generator failed with status ${response.status}`);
    }

    const data = await response.json();
    const authUrl = data.auth_url;

    if (!authUrl) {
      throw new Error('Failed to resolve authenticated streaming URL from JioSaavn');
    }

    // Cache for 30 minutes
    streamUrlCache.set(cacheKey, {
      url: authUrl,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    if (jsonMode) {
      return res.json({ streamUrl: authUrl });
    }

    // Redirect to direct CDN stream
    return res.redirect(302, authUrl);
  } catch (error: any) {
    console.error('Stream resolver error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Direct MP3 Download Proxy Endpoint
app.get('/api/jiosaavn/download', async (req, res) => {
  try {
    const encUrl = req.query.url as string;
    const title = (req.query.title as string) || 'song';
    const artist = (req.query.artist as string) || 'artist';

    if (!encUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Resolve auth url
    const tokenUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&_format=json&_marker=0&cc=in&includeMetaTags=1&url=${encodeURIComponent(
      encUrl
    )}&bitrate=320`;

    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    const data = await tokenRes.json();
    const authUrl = data.auth_url;

    if (!authUrl) {
      return res.status(500).json({ error: 'Could not generate download link' });
    }

    const cleanName = `${title.replace(/[<>:"/\\|?*]+/g, '').trim()} - ${artist
      .replace(/[<>:"/\\|?*]+/g, '')
      .trim()}.mp3`;

    // Fetch the audio stream and pipe to client with attachment headers
    const audioRes = await fetch(authUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!audioRes.ok) {
      return res.redirect(302, authUrl);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    if (audioRes.body) {
      // Stream chunks
      const reader = audioRes.body.getReader();
      const stream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      };
      await stream();
    } else {
      res.redirect(302, authUrl);
    }
  } catch (err: any) {
    console.error('Download proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
