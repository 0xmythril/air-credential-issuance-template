/**
 * Data transformation system for converting provider-specific data
 * to standardized credential format
 */

import { DataTransformer } from '../types';

class DataTransformerRegistry {
  private transformers = new Map<string, DataTransformer>();

  register(transformer: DataTransformer): void {
    this.transformers.set(transformer.name, transformer);
  }

  get(name: string): DataTransformer | undefined {
    return this.transformers.get(name);
  }

  transform(providerName: string, data: Record<string, unknown>): Record<string, unknown> {
    const transformer = this.get(providerName);
    if (!transformer) {
      console.warn(`No transformer found for provider: ${providerName}`);
      return data; // Return data as-is if no transformer
    }

    try {
      return transformer.transform(data);
    } catch (error) {
      console.error(`Error transforming data for provider ${providerName}:`, error);
      return data; // Return original data on error
    }
  }

  getAvailable(): string[] {
    return Array.from(this.transformers.keys());
  }
}

// Export singleton instance
export const transformerRegistry = new DataTransformerRegistry();

// Spotify data transformer - matches spotify.json schema
class SpotifyDataTransformer implements DataTransformer {
  readonly name = 'spotify';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    // Schema fields: display_name, spotify_id, music_diversity_score (int),
    // followed_artists, top_artists, top_genres, top_tracks, total_followed_artists (int)
    const transformed: Record<string, string | number | object> = {};
    
    const arrayToNumberedObject = (arr: unknown[], prefix: string, getName: (item: unknown) => string) => {
      const obj: Record<string, string> = {};
      const items = arr.slice(0, 3); // Limit to 3 items per schema
      items.forEach((item, index) => {
        obj[`${prefix}_${index + 1}`] = getName(item);
      });
      return obj;
    };
    
    // display_name (string)
    if (data.display_name && typeof data.display_name === 'string') {
      transformed.display_name = data.display_name;
    }
    
    // spotify_id (string) - required
    if (data.spotify_id && typeof data.spotify_id === 'string') {
      transformed.spotify_id = data.spotify_id;
    }
    
    // music_diversity_score (integer)
    if (data.music_taste_summary && typeof data.music_taste_summary === 'object') {
      const summary = data.music_taste_summary as Record<string, unknown>;
      
      if (typeof summary.music_diversity_score === 'number') {
        transformed.music_diversity_score = Math.round(summary.music_diversity_score);
      }
      
      // top_genres (nested object with top_genres_1, top_genres_2, top_genres_3)
      if (Array.isArray(summary.top_genres) && summary.top_genres.length > 0) {
        transformed.top_genres = arrayToNumberedObject(
          summary.top_genres,
          'top_genres',
          (genre: unknown) => typeof genre === 'string' ? genre : String(genre)
        );
      }
      
      // total_followed_artists (integer)
      if (typeof summary.total_followed_artists === 'number') {
        transformed.total_followed_artists = Math.round(summary.total_followed_artists);
      }
    }
    
    // followed_artists (nested object with followed_artists_1, 2, 3)
    if (Array.isArray(data.followed_artists) && data.followed_artists.length > 0) {
      transformed.followed_artists = arrayToNumberedObject(
        data.followed_artists,
        'followed_artists',
        (artist: unknown) => {
          if (typeof artist === 'string') return artist;
          const artistObj = artist as { name?: string };
          return artistObj.name || 'Unknown Artist';
        }
      );
    }
    
    // top_artists (nested object with top_artists_1, 2, 3)
    if (Array.isArray(data.top_artists) && data.top_artists.length > 0) {
      transformed.top_artists = arrayToNumberedObject(
        data.top_artists,
        'top_artists',
        (artist: unknown) => {
          if (typeof artist === 'string') return artist;
          const artistObj = artist as { name?: string };
          return artistObj.name || 'Unknown Artist';
        }
      );
    }
    
    // top_tracks (nested object with top_tracks_1, 2, 3)
    if (Array.isArray(data.top_tracks) && data.top_tracks.length > 0) {
      transformed.top_tracks = arrayToNumberedObject(
        data.top_tracks,
        'top_tracks',
        (track: unknown) => {
          if (typeof track === 'string') return track;
          const trackObj = track as { name?: string };
          return trackObj.name || 'Unknown Track';
        }
      );
    }
    
    console.log('🎵 [Spotify Transformer] Transformed data:', transformed);
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null && 'spotify_id' in data;
  }
}

// Wallet data transformer - matches ethos.json schema
class WalletDataTransformer implements DataTransformer {
  readonly name = 'wallet';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    console.log('💼 [Wallet/Ethos Transformer] ===== START TRANSFORMATION =====');
    console.log('💼 [Wallet/Ethos Transformer] Input data:', JSON.stringify(data, null, 2));
    console.log('💼 [Wallet/Ethos Transformer] Schema requires: address (string), score (integer), level (string)');
    
    // Schema fields: address (string), score (integer), level (string)
    const transformed: Record<string, string | number> = {};
    
    // address (string) - required
    if (data.address && typeof data.address === 'string') {
      transformed.address = data.address;
      console.log('💼 [Wallet/Ethos Transformer] ✅ address:', transformed.address);
    } else {
      console.log('💼 [Wallet/Ethos Transformer] ⚠️ address: missing or invalid');
    }
    
    // score (integer)
    if (data.score !== undefined) {
      const score = typeof data.score === 'number' ? data.score : parseInt(String(data.score), 10);
      if (!isNaN(score)) {
        transformed.score = Math.round(score);
        console.log('💼 [Wallet/Ethos Transformer] ✅ score:', transformed.score);
      } else {
        console.log('💼 [Wallet/Ethos Transformer] ⚠️ score: invalid number');
      }
    } else {
      console.log('💼 [Wallet/Ethos Transformer] ⚠️ score: not provided');
    }
    
    // level (string)
    if (data.level && typeof data.level === 'string') {
      transformed.level = data.level;
      console.log('💼 [Wallet/Ethos Transformer] ✅ level:', transformed.level);
    } else {
      console.log('💼 [Wallet/Ethos Transformer] ⚠️ level: missing or invalid');
    }
    
    console.log('💼 [Wallet/Ethos Transformer] ===== TRANSFORMATION COMPLETE =====');
    console.log('💼 [Wallet/Ethos Transformer] Output data:', JSON.stringify(transformed, null, 2));
    console.log('💼 [Wallet/Ethos Transformer] Fields included:', Object.keys(transformed).join(', '));
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null && 'address' in data;
  }
}

// AIR Kit data transformer
class AirKitDataTransformer implements DataTransformer {
  readonly name = 'airkit';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    
    // Pass through AIR Kit data with filtering
    for (const [key, value] of Object.entries(data)) {
      if (key === "user_type") continue;
      if (value != null) {
        transformed[key] = value;
      }
    }
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null;
  }
}

// Twitter data transformer - matches twitter.json schema
class TwitterDataTransformer implements DataTransformer {
  readonly name = 'twitter';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    console.log('🐦 [Twitter Transformer] ===== START TRANSFORMATION =====');
    console.log('🐦 [Twitter Transformer] Input data:', JSON.stringify(data, null, 2));
    console.log('🐦 [Twitter Transformer] Schema fields: username, name, verified (boolean), followers (int), following (int), tweets (string), listed (string), bio, location, joined');
    
    // Schema fields: username, name, verified (boolean), followers (int), 
    // following (int), tweets, listed, bio, location, joined
    const transformed: Record<string, string | number | boolean> = {};

    // username (string) - required
    if (data.username && typeof data.username === 'string') {
      transformed.username = data.username;
      console.log('🐦 [Twitter Transformer] ✅ username:', transformed.username);
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ username: missing or invalid');
    }
    
    // name (string)
    if (data.name && typeof data.name === 'string') {
      transformed.name = data.name;
      console.log('🐦 [Twitter Transformer] ✅ name:', transformed.name);
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ name: missing or invalid');
    }
    
    // verified (boolean)
    if (data.verified !== undefined) {
      transformed.verified = Boolean(data.verified);
      console.log('🐦 [Twitter Transformer] ✅ verified:', transformed.verified);
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ verified: not provided');
    }
    
    // followers (integer) - maps from followers_count
    if (data.followers_count !== undefined) {
      const followers = typeof data.followers_count === 'number' ? data.followers_count : parseInt(String(data.followers_count), 10);
      if (!isNaN(followers)) {
        transformed.followers = Math.round(followers);
        console.log('🐦 [Twitter Transformer] ✅ followers:', transformed.followers, '(from followers_count)');
      } else {
        console.log('🐦 [Twitter Transformer] ⚠️ followers: invalid number');
      }
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ followers_count: not provided');
    }
    
    // following (integer) - maps from following_count
    if (data.following_count !== undefined) {
      const following = typeof data.following_count === 'number' ? data.following_count : parseInt(String(data.following_count), 10);
      if (!isNaN(following)) {
        transformed.following = Math.round(following);
        console.log('🐦 [Twitter Transformer] ✅ following:', transformed.following, '(from following_count)');
      } else {
        console.log('🐦 [Twitter Transformer] ⚠️ following: invalid number');
      }
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ following_count: not provided');
    }
    
    // tweets (string) - maps from tweet_count, convert to string per schema
    if (data.tweet_count !== undefined) {
      transformed.tweets = String(data.tweet_count);
      console.log('🐦 [Twitter Transformer] ✅ tweets:', transformed.tweets, '(from tweet_count, converted to string)');
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ tweet_count: not provided');
    }
    
    // listed (string) - maps from listed_count, convert to string per schema
    if (data.listed_count !== undefined) {
      transformed.listed = String(data.listed_count);
      console.log('🐦 [Twitter Transformer] ✅ listed:', transformed.listed, '(from listed_count, converted to string)');
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ listed_count: not provided');
    }
    
    // bio (string) - maps from description
    if (data.description && typeof data.description === 'string') {
      transformed.bio = data.description;
      console.log('🐦 [Twitter Transformer] ✅ bio:', transformed.bio.substring(0, 50) + '...', '(from description)');
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ description: missing or invalid');
    }
    
    // location (string)
    if (data.location && typeof data.location === 'string') {
      transformed.location = data.location;
      console.log('🐦 [Twitter Transformer] ✅ location:', transformed.location);
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ location: missing or invalid');
    }
    
    // joined (string) - maps from account_created_at
    if (data.account_created_at && typeof data.account_created_at === 'string') {
      transformed.joined = data.account_created_at;
      console.log('🐦 [Twitter Transformer] ✅ joined:', transformed.joined, '(from account_created_at)');
    } else {
      console.log('🐦 [Twitter Transformer] ⚠️ account_created_at: missing or invalid');
    }

    console.log('🐦 [Twitter Transformer] ===== TRANSFORMATION COMPLETE =====');
    console.log('🐦 [Twitter Transformer] Output data:', JSON.stringify(transformed, null, 2));
    console.log('🐦 [Twitter Transformer] Fields included:', Object.keys(transformed).join(', '));
    console.log('🐦 [Twitter Transformer] Excluded fields: twitter_id (not in schema)');
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null && 'username' in data;
  }
}

// Discord data transformer - matches discord.json schema
class DiscordDataTransformer implements DataTransformer {
  readonly name = 'discord';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    console.log('💜 [Discord Transformer] ===== START TRANSFORMATION =====');
    console.log('💜 [Discord Transformer] Input data:', JSON.stringify(data, null, 2));
    console.log('💜 [Discord Transformer] Schema fields: discord_id, username, discriminator (int), guilds_count, owned_guilds_count, connections_count, global_name, verified, locale, premium_type, public_flags');
    
    // Schema fields: discord_id, username, discriminator (int), guilds_count (int), 
    // owned_guilds_count (int), connections_count (int), global_name, verified (boolean),
    // locale, premium_type (int), public_flags (int)
    // Note: email and mfa_enabled are NOT in schema
    const transformed: Record<string, string | number | boolean> = {};

    // discord_id (string)
    if (data.discord_id && typeof data.discord_id === 'string') {
      transformed.discord_id = data.discord_id;
      console.log('💜 [Discord Transformer] ✅ discord_id:', transformed.discord_id);
    } else {
      console.log('💜 [Discord Transformer] ⚠️ discord_id: missing or invalid');
    }

    // username (string)
    if (data.username && typeof data.username === 'string') {
      transformed.username = data.username;
      console.log('💜 [Discord Transformer] ✅ username:', transformed.username);
    } else {
      console.log('💜 [Discord Transformer] ⚠️ username: missing or invalid');
    }
    
    // discriminator (integer) - schema says integer, not string
    if (data.discriminator !== undefined) {
      const disc = typeof data.discriminator === 'number' ? data.discriminator : parseInt(String(data.discriminator), 10);
      if (!isNaN(disc)) {
        transformed.discriminator = Math.round(disc);
        console.log('💜 [Discord Transformer] ✅ discriminator:', transformed.discriminator, '(as integer)');
      } else {
        console.log('💜 [Discord Transformer] ⚠️ discriminator: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ discriminator: not provided');
    }
    
    // guilds_count (integer) - keep original field name
    if (data.guilds_count !== undefined) {
      const guilds = typeof data.guilds_count === 'number' ? data.guilds_count : parseInt(String(data.guilds_count), 10);
      if (!isNaN(guilds)) {
        transformed.guilds_count = Math.round(guilds);
        console.log('💜 [Discord Transformer] ✅ guilds_count:', transformed.guilds_count);
      } else {
        console.log('💜 [Discord Transformer] ⚠️ guilds_count: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ guilds_count: not provided');
    }
    
    // owned_guilds_count (integer) - keep original field name
    if (data.owned_guilds_count !== undefined) {
      const ownedGuilds = typeof data.owned_guilds_count === 'number' ? data.owned_guilds_count : parseInt(String(data.owned_guilds_count), 10);
      if (!isNaN(ownedGuilds)) {
        transformed.owned_guilds_count = Math.round(ownedGuilds);
        console.log('💜 [Discord Transformer] ✅ owned_guilds_count:', transformed.owned_guilds_count);
      } else {
        console.log('💜 [Discord Transformer] ⚠️ owned_guilds_count: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ owned_guilds_count: not provided');
    }
    
    // connections_count (integer) - keep original field name
    if (data.connections_count !== undefined) {
      const connections = typeof data.connections_count === 'number' ? data.connections_count : parseInt(String(data.connections_count), 10);
      if (!isNaN(connections)) {
        transformed.connections_count = Math.round(connections);
        console.log('💜 [Discord Transformer] ✅ connections_count:', transformed.connections_count);
      } else {
        console.log('💜 [Discord Transformer] ⚠️ connections_count: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ connections_count: not provided');
    }
    
    // global_name (string)
    if (data.global_name && typeof data.global_name === 'string') {
      transformed.global_name = data.global_name;
      console.log('💜 [Discord Transformer] ✅ global_name:', transformed.global_name);
    } else {
      console.log('💜 [Discord Transformer] ⚠️ global_name: missing or invalid');
    }
    
    // verified (boolean)
    if (data.verified !== undefined) {
      transformed.verified = Boolean(data.verified);
      console.log('💜 [Discord Transformer] ✅ verified:', transformed.verified);
    } else {
      console.log('💜 [Discord Transformer] ⚠️ verified: not provided');
    }
    
    // locale (string)
    if (data.locale && typeof data.locale === 'string') {
      transformed.locale = data.locale;
      console.log('💜 [Discord Transformer] ✅ locale:', transformed.locale);
    } else {
      console.log('💜 [Discord Transformer] ⚠️ locale: missing or invalid');
    }
    
    // premium_type (integer)
    if (data.premium_type !== undefined) {
      const premium = typeof data.premium_type === 'number' ? data.premium_type : parseInt(String(data.premium_type), 10);
      if (!isNaN(premium)) {
        transformed.premium_type = Math.round(premium);
        console.log('💜 [Discord Transformer] ✅ premium_type:', transformed.premium_type);
      } else {
        console.log('💜 [Discord Transformer] ⚠️ premium_type: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ premium_type: not provided');
    }
    
    // public_flags (integer)
    if (data.public_flags !== undefined) {
      const flags = typeof data.public_flags === 'number' ? data.public_flags : parseInt(String(data.public_flags), 10);
      if (!isNaN(flags)) {
        transformed.public_flags = Math.round(flags);
        console.log('💜 [Discord Transformer] ✅ public_flags:', transformed.public_flags);
      } else {
        console.log('💜 [Discord Transformer] ⚠️ public_flags: invalid number');
      }
    } else {
      console.log('💜 [Discord Transformer] ⚠️ public_flags: not provided');
    }

    console.log('💜 [Discord Transformer] ===== TRANSFORMATION COMPLETE =====');
    console.log('💜 [Discord Transformer] Output data:', JSON.stringify(transformed, null, 2));
    console.log('💜 [Discord Transformer] Fields included:', Object.keys(transformed).join(', '));
    console.log('💜 [Discord Transformer] Excluded fields: email, mfa_enabled (not in schema)');
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null && 'discord_id' in data;
  }
}

// Register all transformers
transformerRegistry.register(new SpotifyDataTransformer());
transformerRegistry.register(new WalletDataTransformer());
transformerRegistry.register(new AirKitDataTransformer());
transformerRegistry.register(new TwitterDataTransformer());
transformerRegistry.register(new DiscordDataTransformer());

// Export transformers
export { SpotifyDataTransformer, WalletDataTransformer, AirKitDataTransformer, TwitterDataTransformer, DiscordDataTransformer };

// Helper function to transform data for any provider
export function transformForCredential(
  providerName: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  return transformerRegistry.transform(providerName, data);
}

