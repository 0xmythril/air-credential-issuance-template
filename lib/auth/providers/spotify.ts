/**
 * Spotify authentication provider implementation
 */

import { signIn, signOut } from "next-auth/react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';
import { env } from "@/lib/env";

// Spotify-specific types
interface SpotifyUser {
  id: string;
  display_name: string | null;
  email: string | null;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  followers: { total: number };
  country: string | null;
}


export class SpotifyAuthProvider extends BaseAuthProvider {
  readonly name = 'spotify';
  readonly displayName = 'Spotify';

  private session: unknown = null;
  private spotifyApi: SpotifyApi | null = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
    
    // Initialize with NextAuth session if available
    if (typeof window !== 'undefined') {
      this.initializeFromSession();
    }
  }

  private initializeFromSession(): void {
    // This will be called by the hook that uses this provider
    // We can't use useSession directly in the class, so we'll need to inject it
  }

  // Method to update session from React hook
  public updateSession(session: Record<string, unknown> | null, status: string): void {
    this.session = session;
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;
    
    this.setLoading(isLoading);
    
    if (isAuthenticated && session?.user) {
      this.setAuthenticated(true);
      this.setAccessToken(session.accessToken as string);
      this.setUser(this.transformUser(session.user as Record<string, unknown>));
      
      // Initialize Spotify API
      this.initializeSpotifyApi(session.accessToken as string);
    } else {
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
      this.spotifyApi = null;
    }
  }

  private transformUser(sessionUser: Record<string, unknown>): AuthUser {
    return {
      id: (sessionUser.email as string) || (sessionUser.name as string) || 'unknown',
      name: sessionUser.name as string,
      email: sessionUser.email as string,
      avatar: sessionUser.image as string,
      metadata: {
        spotifyId: sessionUser.id,
        provider: 'spotify'
      }
    };
  }

  private initializeSpotifyApi(accessToken: string): void {
    try {
      this.spotifyApi = SpotifyApi.withAccessToken(
        env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "spotify-client-placeholder",
        {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: "",
        }
      );
    } catch (error) {
      // Failed to initialize Spotify API
      this.setError(this.createAuthError('Failed to initialize Spotify API', 'SPOTIFY_API_INIT_FAILED', error as Error));
    }
  }

  async signIn(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signIn("spotify");
    }, 'Failed to sign in with Spotify');
  }

  async signOut(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signOut();
      this.spotifyApi = null;
    }, 'Failed to sign out from Spotify');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.spotifyApi || !this.accessToken) {
        throw new Error('Spotify API not initialized or no access token');
      }

      const [topArtists, topTracks, followedArtists] = await Promise.all([
        this.getTopArtists(),
        this.getTopTracks(), 
        this.getFollowedArtists()
      ]);

      const spotifyUser = this.user;
      
      // Calculate music taste summary
      const uniqueGenres = [...new Set(
        [...topArtists, ...followedArtists].flatMap(artist => artist.genres).filter(genre => genre)
      )];
      const topGenres = uniqueGenres.slice(0, 5);

      return {
        user_type: "spotify",
        spotify_id: spotifyUser?.metadata?.spotifyId || spotifyUser?.id,
        top_artists: topArtists,
        top_tracks: topTracks,
        followed_artists: followedArtists,
        music_taste_summary: {
          total_top_artists: topArtists.length,
          total_top_tracks: topTracks.length,
          total_followed_artists: followedArtists.length,
          top_genres: topGenres,
          music_diversity_score: uniqueGenres.length,
        },
      };
    }, 'Failed to fetch Spotify user data');
  }

  async getCurrentUser(): Promise<SpotifyUser | null> {
    if (!this.spotifyApi) return null;
    
    try {
      const userProfile = await this.spotifyApi.currentUser.profile();
      return {
        id: userProfile.id,
        display_name: userProfile.display_name,
        email: userProfile.email,
        images: userProfile.images,
        followers: userProfile.followers,
        country: userProfile.country,
      };
    } catch (error) {
      console.error("Error fetching current user: Spotify API error");
      return null;
    }
  }

  async getFollowedArtists(limit: number = 20): Promise<Array<{ name: string; genres: string[] }>> {
    if (!this.spotifyApi) return [];
    
    try {
      const validLimit = Math.min(Math.max(limit, 1), 50) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50;
      const followedArtists = await this.spotifyApi.currentUser.followedArtists("artist", validLimit);
      return followedArtists.artists.items.map(artist => ({
        name: artist.name,
        genres: artist.genres,
      }));
    } catch (error) {
      console.error("Error fetching followed artists: Spotify API error");
      return [];
    }
  }

  async getTopArtists(
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 20
  ): Promise<Array<{ name: string; genres: string[] }>> {
    if (!this.spotifyApi) return [];
    
    try {
      const topArtists = await this.spotifyApi.currentUser.topItems("artists", timeRange, limit as 1 | 20 | 50);
      return topArtists.items.map(artist => ({
        name: artist.name,
        genres: artist.genres,
      }));
    } catch (error) {
      console.error("Error fetching top artists: Spotify API error");
      return [];
    }
  }

  async getTopTracks(
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 20
  ): Promise<Array<{ name: string; artists: string[] }>> {
    if (!this.spotifyApi) return [];
    
    try {
      const topTracks = await this.spotifyApi.currentUser.topItems("tracks", timeRange, limit as 1 | 20 | 50);
      return topTracks.items.map(track => ({
        name: track.name,
        artists: track.artists.map(artist => artist.name),
      }));
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      return [];
    }
  }
}
