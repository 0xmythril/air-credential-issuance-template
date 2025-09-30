import { signIn, signOut } from "next-auth/react";
import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  locale?: string;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

export class DiscordAuthProvider extends BaseAuthProvider {
  readonly name = 'discord';
  readonly displayName = 'Discord';

  private session: Record<string, unknown> | null = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  public updateSession(session: Record<string, unknown> | null, status: string): void {
    this.session = session;
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    this.setLoading(isLoading);

    if (isAuthenticated && session?.user) {
      this.setAuthenticated(true);
      this.setAccessToken(session.accessToken as string);
      this.setUser(this.transformUser(session.user as Record<string, unknown>));
    } else {
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
    }
  }

  private transformUser(sessionUser: Record<string, unknown>): AuthUser {
    return {
      id: (sessionUser.id as string) || 'unknown',
      name: (sessionUser.name as string) || (sessionUser.username as string),
      email: sessionUser.email as string,
      avatar: sessionUser.image as string,
      metadata: {
        discordId: sessionUser.id,
        username: sessionUser.username,
        discriminator: sessionUser.discriminator,
        provider: 'discord'
      }
    };
  }

  async signIn(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signIn("discord");
    }, 'Failed to sign in with Discord');
  }

  async signOut(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signOut();
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
    }, 'Failed to sign out from Discord');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.accessToken) {
        throw new Error('Discord not authenticated');
      }

      // Fetch user profile
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Discord API error: ${userResponse.status}`);
      }

      const userData = await userResponse.json() as DiscordUser;

      // Fetch guilds (servers)
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      let guilds: DiscordGuild[] = [];
      if (guildsResponse.ok) {
        guilds = await guildsResponse.json() as DiscordGuild[];
      }

      // Fetch connections (linked accounts)
      const connectionsResponse = await fetch('https://discord.com/api/users/@me/connections', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      let connections: unknown[] = [];
      if (connectionsResponse.ok) {
        connections = await connectionsResponse.json() as unknown[];
      }

      return {
        user_type: "discord",
        discord_id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        global_name: userData.global_name,
        verified: userData.verified,
        email: userData.email,
        locale: userData.locale,
        mfa_enabled: userData.mfa_enabled,
        premium_type: userData.premium_type,
        public_flags: userData.public_flags,
        guilds: guilds,
        guilds_count: guilds.length,
        owned_guilds_count: guilds.filter(g => g.owner).length,
        connections: connections,
        connections_count: connections.length,
      } as Record<string, unknown>;
    }, 'Failed to fetch Discord user data');
  }

  public async getDiscordAccessToken(): Promise<string | null> {
    return this.accessToken;
  }
}
