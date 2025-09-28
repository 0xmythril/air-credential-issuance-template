import { signJwt } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../../lib/env";
import { verifySessionAccessToken } from "../../auth/common/login";

// =============================================
// TYPE DEFINITIONS
// =============================================

interface UserDataResponse {
  jwt: string;
  response: object;
}

interface EthosApiResponse {
  score?: number;
  level?: string;
  [key: string]: unknown;
}

interface SpotifyDataResponse {
  spotify_id: string;
  display_name?: string;
  top_artists?: Array<{ name: string; genres: string[] }>;
  top_tracks?: Array<{ name: string; artists: string[] }>;
  followed_artists?: Array<{ name: string; genres: string[] }>;
  music_taste_summary?: {
    total_top_artists: number;
    total_top_tracks: number;
    total_followed_artists: number;
    top_genres: string[];
    music_diversity_score: number;
  };
  [key: string]: unknown;
}

// =============================================
// CONFIGURATION
// =============================================

const CONFIG = {
  // API endpoints
  ETHOS_BASE_URL: "https://api.ethos.network/api/v2/score/address",
  
  // Test configuration (can be easily switched for test builds)
  TEST_ADDRESS: env.NEXT_PRIVATE_TEST_ADDRESS as string | null, // Set to wallet address for testing, null for production
  // Example: TEST_ADDRESS: "0x1234567890123456789012345678901234567890",
} as const;

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Creates a signed JWT response for user data
 */
const createUserDataResponse = async (data: object): Promise<UserDataResponse> => {
  const jwt = await signJwt({
    partnerId: env.NEXT_PUBLIC_PARTNER_ID,
    scope: "issue",
  });

  return { jwt, response: data };
};

/**
 * Fetches data from Ethos API for the specified address
 */
const fetchEthosData = async (address: string): Promise<EthosApiResponse> => {
  console.log("🔄 Starting Ethos data fetch...");
  console.log(`👤 Target address: ${address}${CONFIG.TEST_ADDRESS ? ' (TEST MODE)' : ''}`);

  try {
    const response = await fetch(`${CONFIG.ETHOS_BASE_URL}?address=${address}`);
    
    if (response.ok) {
      const data = await response.json() as EthosApiResponse;
      console.log("✅ Ethos data fetch complete:", data);
      return data;
    } else {
      console.error(`❌ Failed to fetch Ethos data: ${response.status}`);
      return {};
    }
  } catch (error) {
    console.error("❌ Failed to fetch Ethos data:", error);
    return {};
  }
};

// Interface for session token
interface SessionToken {
  sub?: string;
  name?: string;
  email?: string;
  type?: string;
  spotifyAccessToken?: string;
}

// Spotify API response interfaces
interface SpotifyArtist {
  name: string;
  genres: string[];
  id?: string;
}

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  id?: string;
}

interface SpotifyApiResponse<T> {
  items: T[];
}

interface SpotifyFollowResponse {
  artists: SpotifyApiResponse<SpotifyArtist>;
}

/**
 * Fetches Spotify data using the Spotify access token from session
 */
const fetchSpotifyData = async (sessionToken: SessionToken, spotifyAccessToken?: string): Promise<SpotifyDataResponse> => {
  console.log("🔄 Starting Spotify data fetch...");
  
  const spotifyId = sessionToken.sub || 'unknown';
  const displayName = sessionToken.name || spotifyId;
  
  console.log(`👤 Spotify user: ${spotifyId} (${displayName})`);

  let topArtists: Array<{ name: string; genres: string[] }> = [];
  let topTracks: Array<{ name: string; artists: string[] }> = [];
  let followedArtists: Array<{ name: string; genres: string[] }> = [];

  // If we have a Spotify access token, fetch real data
  if (spotifyAccessToken) {
    try {
      console.log("🎵 Fetching Spotify music data...");

      // Fetch top artists (last 6 months)
      const topArtistsResponse = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      if (topArtistsResponse.ok) {
        const topArtistsData: SpotifyApiResponse<SpotifyArtist> = await topArtistsResponse.json();
        topArtists = topArtistsData.items.map((artist: SpotifyArtist) => ({
          name: artist.name,
          genres: artist.genres,
        }));
        console.log(`✅ Fetched ${topArtists.length} top artists`);
      }

      // Fetch top tracks (last 6 months)
      const topTracksResponse = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      if (topTracksResponse.ok) {
        const topTracksData: SpotifyApiResponse<SpotifyTrack> = await topTracksResponse.json();
        topTracks = topTracksData.items.map((track: SpotifyTrack) => ({
          name: track.name,
          artists: track.artists.map((artist: { name: string }) => artist.name),
        }));
        console.log(`✅ Fetched ${topTracks.length} top tracks`);
      }

      // Fetch followed artists
      const followedArtistsResponse = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=20", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      if (followedArtistsResponse.ok) {
        const followedArtistsData: SpotifyFollowResponse = await followedArtistsResponse.json();
        followedArtists = followedArtistsData.artists.items.map((artist: SpotifyArtist) => ({
          name: artist.name,
          genres: artist.genres,
        }));
        console.log(`✅ Fetched ${followedArtists.length} followed artists`);
      }

    } catch (error) {
      console.error("❌ Error fetching Spotify data:", error);
      // Continue with empty arrays if API calls fail
    }
  } else {
    console.log("⚠️ No Spotify access token provided, using basic user info only");
  }

  // Process the data to create meaningful insights
  const uniqueGenres = [...new Set(
    [...topArtists, ...followedArtists]
      .flatMap(artist => artist.genres)
      .filter(genre => genre)
  )];

  const topGenres = uniqueGenres.slice(0, 5); // Top 5 genres

  const responseData: SpotifyDataResponse = {
    spotify_id: spotifyId,
    display_name: displayName,
    top_artists: topArtists,
    top_tracks: topTracks,
    followed_artists: followedArtists,
    // Additional processed data for credentials
    music_taste_summary: {
      total_top_artists: topArtists.length,
      total_top_tracks: topTracks.length,
      total_followed_artists: followedArtists.length,
      top_genres: topGenres,
      music_diversity_score: uniqueGenres.length, // Simple diversity metric
    },
  };

  console.log("✅ Spotify data prepared:", responseData);
  return responseData;
};

// =============================================
// MAIN API HANDLER
// =============================================

export async function POST(request: NextRequest) {
  console.log("🔄 User data API called");
  const sessionAccessToken = request.headers.get("Authorization");

  if (!sessionAccessToken) {
    console.log("❌ No authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionAccessTokenResult;
  try {
    sessionAccessTokenResult = await verifySessionAccessToken(sessionAccessToken);
    console.log("✅ Token verified, user type:", (sessionAccessTokenResult as { type?: string }).type);
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sub: userId, type } = sessionAccessTokenResult as { sub: string; type?: string };

    if (!userId) {
      return NextResponse.json({ error: "user Id not found" }, { status: 400 });
    }

    let responseData: object;

    // Check if this is a Spotify user
    if (type === "spotify") {
      console.log("🎵 Processing Spotify user");
      // Extract Spotify access token from session
      const tokenData = sessionAccessTokenResult as SessionToken;
      const spotifyAccessToken = tokenData.spotifyAccessToken;
      console.log("🔑 Spotify access token available:", !!spotifyAccessToken);
      
      // Fetch Spotify-specific data
      const spotifyData = await fetchSpotifyData(tokenData, spotifyAccessToken);
      responseData = {
        user_type: "spotify",
        ...spotifyData,
      };
      console.log("✅ Spotify data processed, keys:", Object.keys(responseData));
    } else {
      // Determine effective user ID (test mode override) for wallet users
      const effectiveUserId = CONFIG.TEST_ADDRESS || userId;

      // Fetch data from Ethos API
      // Current schema used is: { "address": string, "score": integer, "level": string }
      const ethosData = await fetchEthosData(effectiveUserId);

      responseData = {
        user_type: "wallet",
        // address: effectiveUserId,
        is_test_address: CONFIG.TEST_ADDRESS ? true : false,
        score: ethosData.score,
        level: ethosData.level,
      };
    }

    return NextResponse.json(await createUserDataResponse(responseData));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}