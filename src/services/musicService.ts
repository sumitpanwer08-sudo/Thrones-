import { Track, Playlist } from '../types';
import {
  gotDirewolf,
  gotIronThrone,
  gotFireIce,
  gotIceFire,
  gotWolfBanner,
  DEFAULT_GOT_IMAGE,
} from '../assets/gotImages';

// Curated high-quality audio tracks featuring Game of Thrones Direwolf, Iron Throne, and Fire & Ice artwork
export const CURATED_TRACKS: Track[] = [
  {
    id: 'curated-1',
    title: 'Winter Is Coming (Direwolf Suite)',
    artist: 'House Stark OST',
    album: 'Game of Thrones: Winter Chronicles',
    duration: 184,
    artworkUrl: gotDirewolf,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    genre: 'Epic / OST',
    source: 'curated',
    playCount: 142850,
    releaseYear: 2024,
  },
  {
    id: 'curated-2',
    title: 'The Iron Throne (Forged in Fire)',
    artist: 'Ramin Djawadi Tribute',
    album: 'King of the Andals',
    duration: 215,
    artworkUrl: gotIronThrone,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-cradle-of-your-soul-15700.mp3',
    genre: 'Soundtrack',
    source: 'curated',
    playCount: 98400,
    releaseYear: 2024,
  },
  {
    id: 'curated-3',
    title: 'A Song of Ice and Fire',
    artist: 'Valyrian Symphony',
    album: 'Fire and Ice Epic Orchestra',
    duration: 198,
    artworkUrl: gotFireIce,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    genre: 'Fire & Ice',
    source: 'curated',
    playCount: 312000,
    releaseYear: 2023,
  },
  {
    id: 'curated-4',
    title: 'Fire and Blood (Dragon & Direwolf)',
    artist: 'Targaryen & Stark Ensemble',
    album: 'Realm of Westeros',
    duration: 165,
    artworkUrl: gotIceFire,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73138b1f7d.mp3?filename=watr-fluid-10149.mp3',
    genre: 'Fantasy OST',
    source: 'curated',
    playCount: 86400,
    releaseYear: 2023,
  },
  {
    id: 'curated-5',
    title: 'The North Remembers (Wolfpack Cry)',
    artist: 'Winterfell Guild',
    album: 'Guardians of the Wall',
    duration: 242,
    artworkUrl: gotWolfBanner,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_24e3c54452.mp3?filename=spirit-blossom-15285.mp3',
    genre: 'Atmospheric',
    source: 'curated',
    playCount: 65120,
    releaseYear: 2024,
  },
  {
    id: 'curated-6',
    title: 'King in the North (Battle Hymn)',
    artist: 'Direwolf Legion',
    album: 'Legends of Westeros',
    duration: 178,
    artworkUrl: gotDirewolf,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e01.mp3?filename=tuesday-glitch-12241.mp3',
    genre: 'Epic Battle',
    source: 'curated',
    playCount: 224000,
    releaseYear: 2024,
  }
];

// Curated Playlists with Game of Thrones Wolf, Iron Throne, and Fire & Ice visuals
export const CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-top-hits',
    title: "The Iron Throne & Top Hits",
    description: 'Powerful melodies and chart-topping hits crowned on the forged Iron Throne.',
    coverUrl: gotIronThrone,
    tracks: CURATED_TRACKS,
    genre: 'Iron Throne',
  },
  {
    id: 'playlist-wolf',
    title: 'House Stark Direwolf Hits',
    description: 'Winter chills, wolfpack anthems, and majestic orchestral soundtracks.',
    coverUrl: gotDirewolf,
    tracks: CURATED_TRACKS,
    genre: 'Direwolf',
  },
  {
    id: 'playlist-fire-ice',
    title: 'A Song of Ice and Fire',
    description: 'Clash of frost and flames: epic music representing ice wolves and fire dragons.',
    coverUrl: gotFireIce,
    tracks: [CURATED_TRACKS[0], CURATED_TRACKS[2], CURATED_TRACKS[4]],
    genre: 'Fire & Ice',
  },
  {
    id: 'playlist-dragons',
    title: 'Fire & Blood (Dragons & Wolves)',
    description: 'Blazing embers, high-adrenaline rhythms, and epic fantasy anthems.',
    coverUrl: gotIceFire,
    tracks: [CURATED_TRACKS[1], CURATED_TRACKS[3]],
    genre: 'Dragon Fire',
  },
  {
    id: 'playlist-north',
    title: 'The North Remembers',
    description: 'Atmospheric deep focus soundscapes set in the frozen woods of Winterfell.',
    coverUrl: gotWolfBanner,
    tracks: [CURATED_TRACKS[4], CURATED_TRACKS[0], CURATED_TRACKS[5]],
    genre: 'Winterfell',
  },
];

const AUDIUS_APP_NAME = 'THRONES_MUSIC_PLAYER';
const AUDIUS_API_ENDPOINT = 'https://api.audius.co';

/**
 * Searches JioSaavn API via our internal full-stack proxy
 */
export async function searchJioSaavn(query: string, limit: number = 20): Promise<Track[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `/api/jiosaavn/search?query=${encodeURIComponent(query.trim())}&limit=${limit}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('JioSaavn proxy search failed or offline:', err);
  }
  return [];
}

/**
 * Fetches JioSaavn Trending hits
 */
export async function fetchJioSaavnTrending(limit: number = 20): Promise<Track[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/jiosaavn/trending?limit=${limit}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('JioSaavn trending fetch error:', err);
  }
  return [];
}

/**
 * Normalizes an Audius raw track object into our Track interface
 */
function normalizeAudiusTrack(raw: any): Track | null {
  if (!raw || !raw.id) return null;

  const streamUrl = `${AUDIUS_API_ENDPOINT}/v1/tracks/${raw.id}/stream?app_name=${AUDIUS_APP_NAME}`;

  let artworkUrl = gotDirewolf;
  if (raw.artwork) {
    artworkUrl = raw.artwork['480x480'] || raw.artwork['150x150'] || raw.artwork['1000x1000'] || artworkUrl;
  }

  return {
    id: `audius-${raw.id}`,
    title: raw.title || 'Untitled Track',
    artist: raw.user?.name || raw.user?.handle || 'Unknown Artist',
    album: raw.genre || 'Audius Trending',
    duration: typeof raw.duration === 'number' && raw.duration > 0 ? raw.duration : 180,
    artworkUrl,
    streamUrl,
    genre: raw.genre || 'Electronic',
    source: 'audius',
    playCount: raw.play_count || raw.favorite_count || 12000,
    releaseYear: raw.release_date ? new Date(raw.release_date).getFullYear() : 2024,
  };
}

/**
 * Normalizes an iTunes raw track object for mainstream artist searches
 */
function normalizeItunesTrack(raw: any): Track | null {
  if (!raw || !raw.previewUrl) return null;

  const artworkUrl = raw.artworkUrl100
    ? raw.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
    : gotFireIce;

  return {
    id: `itunes-${raw.trackId}`,
    title: raw.trackName || 'Untitled Song',
    artist: raw.artistName || 'Unknown Artist',
    album: raw.collectionName || 'Single',
    duration: raw.trackTimeMillis ? Math.round(raw.trackTimeMillis / 1000) : 30,
    artworkUrl,
    streamUrl: raw.previewUrl,
    genre: raw.primaryGenreName || 'Pop',
    source: 'itunes',
    playCount: 500000 + Math.floor(Math.random() * 200000),
    releaseYear: raw.releaseDate ? new Date(raw.releaseDate).getFullYear() : 2023,
  };
}

/**
 * Fetches trending tracks combining JioSaavn and Audius with fallback to curated library
 */
export async function fetchTrendingTracks(limit: number = 24): Promise<Track[]> {
  try {
    // Run both JioSaavn and Audius trending fetches in parallel
    const [jiosaavnTracks, audiusData] = await Promise.allSettled([
      fetchJioSaavnTrending(15),
      (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `${AUDIUS_API_ENDPOINT}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=12`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data)
          ? json.data.map(normalizeAudiusTrack).filter((t: any): t is Track => t !== null)
          : [];
      })(),
    ]);

    const jioList = jiosaavnTracks.status === 'fulfilled' ? jiosaavnTracks.value : [];
    const audiusList = audiusData.status === 'fulfilled' ? audiusData.value : [];

    const combined = [...jioList, ...audiusList, ...CURATED_TRACKS];

    const seen = new Set<string>();
    const deduplicated = combined.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    return deduplicated.length > 0 ? deduplicated : CURATED_TRACKS;
  } catch (err) {
    console.warn('Trending fetch error, falling back to curated tracks:', err);
    return CURATED_TRACKS;
  }
}

/**
 * Searches music across JioSaavn (primary), Audius, and iTunes to find any song in the world
 */
export async function searchMusic(query: string): Promise<Track[]> {
  const trimmed = query.trim();
  if (!trimmed) return CURATED_TRACKS;

  const results: Track[] = [];
  const seenIds = new Set<string>();

  // 1. Search JioSaavn first (supports Hindi, Punjabi, Bollywood, English, and all Indian & Global tracks)
  const jioPromise = searchJioSaavn(trimmed, 20);

  // 2. Search Audius
  const audiusPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `${AUDIUS_API_ENDPOINT}/v1/tracks/search?query=${encodeURIComponent(trimmed)}&app_name=${AUDIUS_APP_NAME}&limit=10`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data
            .map(normalizeAudiusTrack)
            .filter((t: Track | null): t is Track => t !== null);
        }
      }
    } catch (err) {
      console.warn('Audius search error:', err);
    }
    return [];
  })();

  // 3. Search iTunes
  const itunesPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=10`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.results)) {
          return json.results
            .map(normalizeItunesTrack)
            .filter((t: Track | null): t is Track => t !== null);
        }
      }
    } catch (err) {
      console.warn('iTunes search error:', err);
    }
    return [];
  })();

  const [jioRes, audiusRes, itunesRes] = await Promise.all([
    jioPromise,
    audiusPromise,
    itunesPromise,
  ]);

  // Merge JioSaavn tracks first (highest relevance for user request)
  for (const track of jioRes) {
    if (!seenIds.has(track.id)) {
      seenIds.add(track.id);
      results.push(track);
    }
  }

  // Merge Audius & iTunes results
  for (const track of [...audiusRes, ...itunesRes]) {
    if (!seenIds.has(track.id)) {
      seenIds.add(track.id);
      results.push(track);
    }
  }

  // Also check local curated
  const curatedMatches = CURATED_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
      t.artist.toLowerCase().includes(trimmed.toLowerCase())
  );
  for (const track of curatedMatches) {
    if (!seenIds.has(track.id)) {
      seenIds.add(track.id);
      results.push(track);
    }
  }

  return results;
}

/**
 * Direct MP3 Download Implementation
 * Fetches audio as a Blob in JavaScript and forces clean local file download
 * (e.g., song_title.mp3) directly in the browser without opening a new tab or page redirect.
 */
export async function downloadTrackAudio(
  track: Track,
  onProgress?: (progressPct: number) => void
): Promise<void> {
  const sanitize = (str: string) =>
    str.replace(/[<>:"/\\|?*]+/g, '').trim() || 'Track';
  const fileName = `${sanitize(track.title)} - ${sanitize(track.artist)}.mp3`;

  // For JioSaavn tracks with encryptedMediaUrl, we can use our dedicated download proxy
  if (track.source === 'jiosaavn' && track.encryptedMediaUrl) {
    if (onProgress) onProgress(20);
    const downloadUrl = `/api/jiosaavn/download?url=${encodeURIComponent(
      track.encryptedMediaUrl
    )}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`;

    try {
      const response = await fetch(downloadUrl);
      if (response.ok) {
        if (onProgress) onProgress(60);
        const blob = await response.blob();
        if (onProgress) onProgress(90);

        const audioBlob = new Blob([blob], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(audioBlob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
        if (onProgress) onProgress(100);
        return;
      }
    } catch (proxyErr) {
      console.warn('Download proxy fetch failed, falling back to direct stream:', proxyErr);
    }
  }

  try {
    if (onProgress) onProgress(10);

    const response = await fetch(track.streamUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audio stream. Server returned ${response.status}`);
    }

    if (onProgress) onProgress(40);

    // Read the blob data
    const blob = await response.blob();
    if (onProgress) onProgress(80);

    // Create a Blob with audio/mpeg MIME type
    const audioBlob = new Blob([blob], { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(audioBlob);

    if (onProgress) onProgress(100);

    // Trigger local download seamlessly in the browser without new tab / page redirect
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (error) {
    console.warn('Direct Blob fetch failed, falling back to direct anchor download trigger:', error);

    // Fallback: trigger download attribute directly without new tab
    const fallbackLink = document.createElement('a');
    fallbackLink.href = track.streamUrl;
    fallbackLink.download = fileName;
    fallbackLink.setAttribute('target', '_self');
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();

    setTimeout(() => {
      if (document.body.contains(fallbackLink)) {
        document.body.removeChild(fallbackLink);
      }
    }, 1000);
  }
}
