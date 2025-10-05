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

interface TwitterDataResponse {
  twitter_id: string;
  username: string;
  name: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  verified: boolean;
  description?: string;
  location?: string;
  url?: string;
  account_created_at?: string;
  [key: string]: unknown;
}

interface DiscordDataResponse {
  discord_id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  verified?: boolean;
  email?: string;
  locale?: string;
  mfa_enabled?: boolean;
  premium_type?: number;
  public_flags?: number;
  guilds_count: number;
  owned_guilds_count: number;
  connections_count: number;
  [key: string]: unknown;
}

interface LinkedInDataResponse {
  linkedin_id: string;
  name: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  profile_url?: string;
  headline?: string;
  location?: string;
  connections?: number;
  position?: string;
  company?: string;
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
  // Fetching Ethos data for address: ${address}${CONFIG.TEST_ADDRESS ? ' (TEST MODE)' : ''}

  try {
    const response = await fetch(`${CONFIG.ETHOS_BASE_URL}?address=${address}`);
    
    if (response.ok) {
      const data = await response.json() as EthosApiResponse;
      return data;
    } else {
      console.error(`❌ Failed to fetch Ethos data: ${response.status}`);
      return {};
    }
  } catch (error) {
    console.error("❌ Failed to fetch Ethos data: Network or API error");
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
  twitterAccessToken?: string;
  discordAccessToken?: string;
  linkedinAccessToken?: string;
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
  const spotifyId = sessionToken.sub || 'unknown';
  const displayName = sessionToken.name || spotifyId;

  let topArtists: Array<{ name: string; genres: string[] }> = [];
  let topTracks: Array<{ name: string; artists: string[] }> = [];
  let followedArtists: Array<{ name: string; genres: string[] }> = [];

  // If we have a Spotify access token, fetch real data
  if (spotifyAccessToken) {
    try {

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
      }

    } catch (error) {
      // Error fetching Spotify data - using basic user info only
      // Continue with empty arrays if API calls fail
    }
  } else {
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

  return responseData;
};

/**
 * Fetches Twitter data using the Twitter access token from session
 */
const fetchTwitterData = async (sessionToken: SessionToken, twitterAccessToken?: string): Promise<TwitterDataResponse> => {
  const twitterId = sessionToken.sub || 'unknown';
  const username = sessionToken.name || twitterId;

  // Default response structure
  let responseData: TwitterDataResponse = {
    twitter_id: twitterId,
    username: username,
    name: username,
    followers_count: 0,
    following_count: 0,
    tweet_count: 0,
    listed_count: 0,
    verified: false,
  };

  // If we have a Twitter access token, fetch real data
  if (twitterAccessToken) {
    try {
      // Fetch user profile data using Twitter API v2
      const userResponse = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=created_at,description,id,location,name,profile_image_url,public_metrics,url,username,verified',
        {
          headers: {
            'Authorization': `Bearer ${twitterAccessToken}`,
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = userData.data;

        responseData = {
          twitter_id: user.id,
          username: user.username,
          name: user.name,
          followers_count: user.public_metrics?.followers_count || 0,
          following_count: user.public_metrics?.following_count || 0,
          tweet_count: user.public_metrics?.tweet_count || 0,
          listed_count: user.public_metrics?.listed_count || 0,
          verified: user.verified || false,
          description: user.description,
          location: user.location,
          url: user.url,
          account_created_at: user.created_at,
        };
      }
    } catch (error) {
      // Error fetching Twitter data - using basic user info only
      console.error("Error fetching Twitter data:", error);
    }
  }

  return responseData;
};

/**
 * Fetches Discord data using the Discord access token from session
 */
const fetchDiscordData = async (sessionToken: SessionToken, discordAccessToken?: string): Promise<DiscordDataResponse> => {
  const discordId = sessionToken.sub || 'unknown';
  const username = sessionToken.name || discordId;

  // Default response structure
  const responseData: DiscordDataResponse = {
    discord_id: discordId,
    username: username,
    discriminator: '0',
    guilds_count: 0,
    owned_guilds_count: 0,
    connections_count: 0,
  };

  // If we have a Discord access token, fetch real data
  if (discordAccessToken) {
    try {
      // Fetch user profile data
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${discordAccessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        responseData.discord_id = userData.id;
        responseData.username = userData.username;
        responseData.discriminator = userData.discriminator || '0';
        responseData.global_name = userData.global_name;
        responseData.verified = userData.verified;
        responseData.email = userData.email;
        responseData.locale = userData.locale;
        responseData.mfa_enabled = userData.mfa_enabled;
        responseData.premium_type = userData.premium_type;
        responseData.public_flags = userData.public_flags;
      }

      // Fetch guilds (servers)
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${discordAccessToken}`,
        },
      });

      if (guildsResponse.ok) {
        const guilds = await guildsResponse.json();
        responseData.guilds_count = guilds.length;
        responseData.owned_guilds_count = guilds.filter((g: { owner: boolean }) => g.owner).length;
      }

      // Fetch connections (linked accounts)
      const connectionsResponse = await fetch('https://discord.com/api/users/@me/connections', {
        headers: {
          'Authorization': `Bearer ${discordAccessToken}`,
        },
      });

      if (connectionsResponse.ok) {
        const connections = await connectionsResponse.json();
        responseData.connections_count = connections.length;
      }
    } catch (error) {
      console.error("Error fetching Discord data:", error);
    }
  }

  return responseData;
};

/**
 * Fetches LinkedIn data using the LinkedIn access token from session
 */
const fetchLinkedInData = async (sessionToken: SessionToken, linkedinAccessToken?: string): Promise<LinkedInDataResponse> => {
  const linkedinId = sessionToken.sub || 'unknown';
  const name = sessionToken.name || linkedinId;
  const email = sessionToken.email || '';

  // Default response structure
  const responseData: LinkedInDataResponse = {
    linkedin_id: linkedinId,
    name: name,
    email: email,
  };

  // If we have a LinkedIn access token, fetch real data
  if (linkedinAccessToken) {
    try {
      console.log("💼 [LinkedIn API] Fetching profile data with access token");
      
      // Fetch comprehensive profile data using LinkedIn API v2 with userinfo endpoint
      // This endpoint provides OpenID Connect standard claims plus LinkedIn-specific data
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log("💼 [LinkedIn API] Profile data received:", profileData);
        
        // Standard OpenID Connect fields
        responseData.linkedin_id = profileData.sub || linkedinId;
        responseData.name = profileData.name || name;
        responseData.email = profileData.email || email;
        
        // LinkedIn-specific fields from userinfo endpoint
        if (profileData.given_name) responseData.given_name = profileData.given_name;
        if (profileData.family_name) responseData.family_name = profileData.family_name;
        if (profileData.picture) responseData.picture = profileData.picture;
        if (profileData.locale) responseData.locale = profileData.locale;
      }

      // Fetch additional profile data from /v2/me endpoint (requires r_liteprofile or r_basicprofile)
      const meResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams),vanityName)', {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log("💼 [LinkedIn API] /v2/me data received:", meData);
        
        // Profile URL (vanityName is the custom LinkedIn URL)
        if (meData.vanityName) {
          responseData.profile_url = `https://www.linkedin.com/in/${meData.vanityName}`;
        }
        
        // Localized names (if not already set)
        if (!responseData.name && meData.localizedFirstName && meData.localizedLastName) {
          responseData.name = `${meData.localizedFirstName} ${meData.localizedLastName}`.trim();
        }
      }

      // Note: To get position, company, headline, and connections, you need:
      // 1. Marketing Developer Platform access (requires LinkedIn partnership)
      // 2. Additional scopes: r_basicprofile, r_organization_social
      // 3. Different API endpoints that require application review
      
      // For now, we're using the freely available OpenID Connect data
      console.log("💼 [LinkedIn API] Final response data:", responseData);

    } catch (error) {
      console.error("💼 [LinkedIn API] Error fetching LinkedIn data:", error);
    }
  }

  return responseData;
};

// =============================================
// MAIN API HANDLER
// =============================================

export async function POST(request: NextRequest) {
  const sessionAccessToken = request.headers.get("Authorization");

  if (!sessionAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionAccessTokenResult;
  try {
    sessionAccessTokenResult = await verifySessionAccessToken(sessionAccessToken);
  } catch (error) {
    console.error("❌ Token verification failed: Invalid or expired token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sub: userId, type } = sessionAccessTokenResult as { sub: string; type?: string };

    if (!userId) {
      return NextResponse.json({ error: "user Id not found" }, { status: 400 });
    }

    let responseData;

    // Check authentication type and fetch appropriate data
    if (type === "spotify") {
      // Extract Spotify access token from session
      const tokenData = sessionAccessTokenResult as SessionToken;
      const spotifyAccessToken = tokenData.spotifyAccessToken;
      
      // Fetch Spotify-specific data
      const spotifyData = await fetchSpotifyData(tokenData, spotifyAccessToken);
      responseData = {
        user_type: "spotify",
        ...spotifyData,
      };
    } else if (type === "twitter") {
      // Extract Twitter access token from session
      const tokenData = sessionAccessTokenResult as SessionToken;
      const twitterAccessToken = tokenData.twitterAccessToken;
      
      // Fetch Twitter-specific data
      const twitterData = await fetchTwitterData(tokenData, twitterAccessToken);
      responseData = {
        user_type: "twitter",
        ...twitterData,
      };
    } else if (type === "discord") {
      // Extract Discord access token from session
      const tokenData = sessionAccessTokenResult as SessionToken;
      const discordAccessToken = tokenData.discordAccessToken;
      
      // Fetch Discord-specific data
      const discordData = await fetchDiscordData(tokenData, discordAccessToken);
      responseData = {
        user_type: "discord",
        ...discordData,
      };
    } else if (type === "linkedin") {
      // Extract LinkedIn access token from session
      const tokenData = sessionAccessTokenResult as SessionToken;
      const linkedinAccessToken = tokenData.linkedinAccessToken;
      
      // Fetch LinkedIn-specific data
      const linkedinData = await fetchLinkedInData(tokenData, linkedinAccessToken);
      responseData = {
        user_type: "linkedin",
        ...linkedinData,
      };
    } else {
      // Determine effective user ID (test mode override) for wallet users
      const effectiveUserId = CONFIG.TEST_ADDRESS || userId;

      console.log('💼 [API user-data] Wallet/Ethos route detected');
      console.log('💼 [API user-data] Wallet address (userId):', userId);
      console.log('💼 [API user-data] Effective userId (with test override):', effectiveUserId);

      // Fetch data from Ethos API
      // Schema: { "address": string, "score": integer, "level": string }
      const ethosData = await fetchEthosData(effectiveUserId);

      console.log('💼 [API user-data] Ethos API response:', ethosData);

      // Return only schema-compliant fields: address, score, level
      responseData = {
        address: userId, // Use the actual wallet address from the JWT (not test address)
        score: ethosData.score,
        level: ethosData.level,
        is_test_address: CONFIG.TEST_ADDRESS ? true : false, // Keep for internal use, filtered later
      };

      console.log('💼 [API user-data] Response data:', responseData);
    }

    return NextResponse.json(await createUserDataResponse(responseData));
  } catch (error) {
    console.error("Error fetching user data: Internal server error");
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}