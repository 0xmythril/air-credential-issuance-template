// Type definitions for IssuanceModal

export interface SpotifyArtist {
  name: string;
  genres?: string[];
}

export interface SpotifyTrack {
  name: string;
  artists?: string[];
}

export interface MusicTasteSummary {
  music_diversity_score?: number;
  top_genres?: string[];
  total_followed_artists?: number;
}

export interface SpotifyUserData {
  user_type?: string;
  spotify_id?: string;
  display_name?: string;
  followed_artists?: SpotifyArtist[] | unknown[];
  top_artists?: SpotifyArtist[] | unknown[];
  top_tracks?: SpotifyTrack[] | unknown[];
  music_taste_summary?: MusicTasteSummary | Record<string, unknown>;
}

export interface TwitterUserData {
  user_type?: string;
  twitter_id?: string;
  username?: string;
  name?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  listed_count?: number;
  verified?: boolean;
  description?: string;
  location?: string;
  url?: string;
  account_created_at?: string;
}

export type CredentialData = Record<string, string | number | boolean | object>;
