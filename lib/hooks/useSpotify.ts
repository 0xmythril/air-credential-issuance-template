import { useSession, signIn, signOut } from "next-auth/react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useMemo } from "react";
import { env } from "@/lib/env";

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email: string | null;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  followers: { total: number };
  country: string | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: Array<{ url: string; height: number | null; width: number | null }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number | null; width: number | null }>;
  };
  popularity: number;
  duration_ms: number;
}

export interface UseSpotifyReturn {
  // Session
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, unknown> | null; // NextAuth session user structure
  accessToken: string | null;
  
  // Auth actions
  signIn: () => void;
  signOut: () => void;
  
  // API methods
  getCurrentUser: () => Promise<SpotifyUser | null>;
  getFollowedArtists: (limit?: number) => Promise<SpotifyArtist[]>;
  getTopArtists: (timeRange?: "short_term" | "medium_term" | "long_term", limit?: number) => Promise<SpotifyArtist[]>;
  getTopTracks: (timeRange?: "short_term" | "medium_term" | "long_term", limit?: number) => Promise<SpotifyTrack[]>;
}

export const useSpotify = (): UseSpotifyReturn => {
  const { data: session, status } = useSession();
  
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.accessToken;
  const accessToken = session?.accessToken as string | null;
  // NextAuth session.user has different structure than SpotifyUser
  const user = session?.user || null;

  // Create Spotify API instance
  const spotifyApi = useMemo(() => {
    if (!accessToken) return null;
    
    // Note: The Spotify Web API SDK requires a client ID, but for server-side token usage,
    // we can use any placeholder as the actual authentication is done via the access token
    return SpotifyApi.withAccessToken(
      env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "spotify-client-placeholder",
      {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600, // Default value
        refresh_token: "", // We handle refresh via NextAuth
      }
    );
  }, [accessToken]);

  const getCurrentUser = async (): Promise<SpotifyUser | null> => {
    console.log("🎵 [useSpotify] getCurrentUser called");
    console.log("🎵 [useSpotify] spotifyApi exists:", !!spotifyApi);
    console.log("🎵 [useSpotify] accessToken exists:", !!accessToken);
    
    if (!spotifyApi) {
      console.log("🎵 [useSpotify] No Spotify API instance, returning null");
      return null;
    }
    
    try {
      console.log("🎵 [useSpotify] Calling Spotify API currentUser.profile()...");
      const userProfile = await spotifyApi.currentUser.profile();
      console.log("🎵 [useSpotify] ✅ Successfully fetched user profile:", userProfile);
      return {
        id: userProfile.id,
        display_name: userProfile.display_name,
        email: userProfile.email,
        images: userProfile.images,
        followers: userProfile.followers,
        country: userProfile.country,
      };
    } catch (error) {
      console.error("🎵 [useSpotify] ❌ Error fetching current user:", error);
      
      // Re-throw the error so it can be caught in the auth handler
      throw error;
    }
  };

  const getFollowedArtists = async (limit: number = 20): Promise<SpotifyArtist[]> => {
    if (!spotifyApi) return [];
    
    try {
      // Ensure limit is within acceptable range for Spotify API
      const validLimit = Math.min(Math.max(limit, 1), 50) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50;
      const followedArtists = await spotifyApi.currentUser.followedArtists("artist", validLimit);
      return followedArtists.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers,
        images: artist.images,
      }));
    } catch (error) {
      console.error("Error fetching followed artists:", error);
      return [];
    }
  };

  const getTopArtists = async (
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 20
  ): Promise<SpotifyArtist[]> => {
    if (!spotifyApi) return [];
    
    try {
      const topArtists = await spotifyApi.currentUser.topItems("artists", timeRange, limit as 1 | 20 | 50);
      return topArtists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers,
        images: artist.images,
      }));
    } catch (error) {
      console.error("Error fetching top artists:", error);
      return [];
    }
  };

  const getTopTracks = async (
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 20
  ): Promise<SpotifyTrack[]> => {
    if (!spotifyApi) return [];
    
    try {
      const topTracks = await spotifyApi.currentUser.topItems("tracks", timeRange, limit as 1 | 20 | 50);
      return topTracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => ({ id: artist.id, name: artist.name })),
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images,
        },
        popularity: track.popularity,
        duration_ms: track.duration_ms,
      }));
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      return [];
    }
  };

  return {
    // Session
    isAuthenticated,
    isLoading,
    user,
    accessToken,
    
    // Auth actions
    signIn: () => signIn("spotify"),
    signOut: () => signOut(),
    
    // API methods
    getCurrentUser,
    getFollowedArtists,
    getTopArtists,
    getTopTracks,
  };
};
