import { env } from "@/lib/env";
import type { AuthMethod } from "@/lib/contexts/AuthMethodContext";
import type { SpotifyUserData, SpotifyArtist, SpotifyTrack, MusicTasteSummary, CredentialData } from "./types";
import { transformerRegistry } from "@/lib/auth/transformers";

/**
 * Helper function to convert array to numbered object with prefixed keys (limit to 3 items)
 */
const arrayToNumberedObject = (
  arr: unknown[],
  prefix: string,
  getName: (item: unknown) => string
): Record<string, string> => {
  const obj: Record<string, string> = {};
  const items = arr.slice(0, 3); // Limit to 3 items
  items.forEach((item, index) => {
    obj[`${prefix}_${index + 1}`] = getName(item);
  });
  return obj;
};

/**
 * Transform data to be AIR Kit credential compatible (single level, objects with numbered keys)
 */
export const transformForCredential = (
  data: SpotifyUserData | Record<string, unknown>
): CredentialData => {
  const transformed: CredentialData = {};

  console.log('🔄 [transformForCredential] Input user_type:', data.user_type);

  // Handle Twitter data - use transformer registry
  if (data.user_type === "twitter") {
    console.log('🔄 [transformForCredential] Detected Twitter data, using TwitterDataTransformer');
    return transformerRegistry.transform('twitter', data) as CredentialData;
  }

  // Handle Discord data - use transformer registry
  if (data.user_type === "discord") {
    console.log('🔄 [transformForCredential] Detected Discord data, using DiscordDataTransformer');
    return transformerRegistry.transform('discord', data) as CredentialData;
  }

  // Handle Spotify data
  if (data.user_type === "spotify") {
    // Basic user info (exclude user_type and display_name as requested)
    if (data.spotify_id) transformed.spotify_id = data.spotify_id;

    // Transform arrays to numbered objects with prefixed keys (top 3 only)
    if (Array.isArray(data.followed_artists) && data.followed_artists.length > 0) {
      transformed.followed_artists = arrayToNumberedObject(
        data.followed_artists,
        "followed_artists",
        (artist: unknown) => {
          if (typeof artist === "string") return artist;
          const artistObj = artist as SpotifyArtist;
          return artistObj.name || "Unknown Artist";
        }
      );
    }
    if (Array.isArray(data.top_artists) && data.top_artists.length > 0) {
      transformed.top_artists = arrayToNumberedObject(
        data.top_artists,
        "top_artists",
        (artist: unknown) => {
          if (typeof artist === "string") return artist;
          const artistObj = artist as SpotifyArtist;
          return artistObj.name || "Unknown Artist";
        }
      );
    }
    if (Array.isArray(data.top_tracks) && data.top_tracks.length > 0) {
      transformed.top_tracks = arrayToNumberedObject(
        data.top_tracks,
        "top_tracks",
        (track: unknown) => {
          if (typeof track === "string") return track;
          const trackObj = track as SpotifyTrack;
          return trackObj.name || "Unknown Track";
        }
      );
    }

    // Flatten music_taste_summary into individual fields
    if (data.music_taste_summary && typeof data.music_taste_summary === "object") {
      const summary = data.music_taste_summary as MusicTasteSummary;
      if (typeof summary.music_diversity_score === "number") {
        transformed.music_diversity_score = summary.music_diversity_score;
      }
      if (Array.isArray(summary.top_genres) && summary.top_genres.length > 0) {
        transformed.top_genres = arrayToNumberedObject(
          summary.top_genres,
          "top_genres",
          (genre: unknown) => (typeof genre === "string" ? genre : String(genre))
        );
      }
      if (typeof summary.total_followed_artists === "number") {
        transformed.total_followed_artists = summary.total_followed_artists;
      }
    }
  } else {
    // Handle wallet/other data
    console.log('🔄 [transformForCredential] Processing wallet/ethos data');
    console.log('🔄 [transformForCredential] Input data:', JSON.stringify(data, null, 2));
    
    // Fields to exclude (metadata, not part of schema)
    const excludedFields = ["is_test_address", "user_type"];
    
    for (const [key, value] of Object.entries(data)) {
      if (excludedFields.includes(key)) {
        console.log(`🔄 [transformForCredential] ⏭️ Skipping metadata field: ${key}`);
        continue;
      }
      if (value != null) {
        transformed[key] = value as string | number | boolean | object;
        console.log(`🔄 [transformForCredential] ✅ Included field: ${key} = ${JSON.stringify(value)}`);
      } else {
        console.log(`🔄 [transformForCredential] ⚠️ Skipped null/undefined field: ${key}`);
      }
    }
    
    console.log('🔄 [transformForCredential] Output:', JSON.stringify(transformed, null, 2));
    console.log('🔄 [transformForCredential] Final fields:', Object.keys(transformed).join(', '));
  }

  return transformed;
};

/**
 * Get dynamic headline based on auth method
 */
export const getHeadline = (authMethod: AuthMethod): string => {
  if (env.NEXT_PUBLIC_HEADLINE && env.NEXT_PUBLIC_HEADLINE.trim() !== "") {
    return env.NEXT_PUBLIC_HEADLINE;
  }

  switch (authMethod) {
    case "spotify":
      return "Store your Music Taste Securely on Moca Network";
    case "twitter":
      return "Store your Twitter Profile Securely on Moca Network";
    case "discord":
      return "Store your Discord Profile Securely on Moca Network";
    case "wallet":
      return "Store your Reputation Securely on Moca Network";
    case "airkit":
      return "Store your Data Securely on Moca Network";
    default:
      return "Store your Data Securely on Moca Network";
  }
};
