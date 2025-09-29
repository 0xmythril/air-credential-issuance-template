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

// Spotify data transformer
class SpotifyDataTransformer implements DataTransformer {
  readonly name = 'spotify';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, string | number | boolean | object> = {};
    
    const arrayToNumberedObject = (arr: unknown[], prefix: string, getName: (item: unknown) => string) => {
      const obj: Record<string, string> = {};
      const items = arr.slice(0, 3); // Limit to 3 items
      items.forEach((item, index) => {
        obj[`${prefix}_${index + 1}`] = getName(item);
      });
      return obj;
    };
    
    if (data.user_type === "spotify") {
      // Basic user info
      if (data.spotify_id) transformed.spotify_id = data.spotify_id;
      
      // Transform arrays to numbered objects with prefixed keys
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
      
      // Extract music taste summary to top-level keys
      if (data.music_taste_summary && typeof data.music_taste_summary === 'object') {
        const summary = data.music_taste_summary as Record<string, unknown>;
        
        if (typeof summary.music_diversity_score === 'number') {
          transformed.music_diversity_score = summary.music_diversity_score;
        }
        
        if (Array.isArray(summary.top_genres) && summary.top_genres.length > 0) {
          transformed.top_genres = arrayToNumberedObject(
            summary.top_genres,
            'top_genres',
            (genre: unknown) => typeof genre === 'string' ? genre : String(genre)
          );
        }
        
        if (typeof summary.total_followed_artists === 'number') {
          transformed.total_followed_artists = summary.total_followed_artists;
        }
      }
    } else {
      // For non-Spotify data, pass through with filtering
      for (const [key, value] of Object.entries(data)) {
        if (key === "is_test_address" || key === "user_type") continue;
        if (value != null) {
          transformed[key] = value as string | number | boolean | object;
        }
      }
    }
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    // Basic validation for Spotify data
    return typeof data === 'object' && data !== null;
  }
}

// Wallet data transformer  
class WalletDataTransformer implements DataTransformer {
  readonly name = 'wallet';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    
    // Pass through wallet data with filtering
    for (const [key, value] of Object.entries(data)) {
      if (key === "is_test_address" || key === "user_type") continue;
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

// Register all transformers
transformerRegistry.register(new SpotifyDataTransformer());
transformerRegistry.register(new WalletDataTransformer());
transformerRegistry.register(new AirKitDataTransformer());

// Export transformers
export { SpotifyDataTransformer, WalletDataTransformer, AirKitDataTransformer };

// Helper function to transform data for any provider
export function transformForCredential(
  providerName: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  return transformerRegistry.transform(providerName, data);
}
