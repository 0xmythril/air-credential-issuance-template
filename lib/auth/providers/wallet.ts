/**
 * Wallet authentication provider implementation
 */

import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

export class WalletAuthProvider extends BaseAuthProvider {
  readonly name = 'wallet';
  readonly displayName = 'Crypto Wallet';

  private address: string | null = null;
  private chainId: number | null = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  // Method to update wallet state from React hook
  public updateWalletState(address: string | null, isConnected: boolean, chainId?: number): void {
    this.address = address;
    this.chainId = chainId || null;
    
    this.setAuthenticated(isConnected && !!address);
    
    if (isConnected && address) {
      this.setUser(this.transformUser(address));
      this.setAccessToken(address); // Use address as access token for wallet
    } else {
      this.setUser(null);
      this.setAccessToken(null);
    }
  }

  private transformUser(address: string): AuthUser {
    return {
      id: address,
      name: this.formatAddress(address),
      email: null,
      avatar: null,
      metadata: {
        address,
        chainId: this.chainId,
        provider: 'wallet'
      }
    };
  }

  private formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async signIn(): Promise<void> {
    // This will be handled by the wagmi connect modal
    // The actual connection is managed by the useAccount hook
    throw new Error('Wallet sign-in should be handled by the connect modal');
  }

  async signOut(): Promise<void> {
    // This will be handled by the wagmi disconnect
    // The actual disconnection is managed by the useDisconnect hook
    throw new Error('Wallet sign-out should be handled by the disconnect function');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.address) {
        throw new Error('No wallet address available');
      }

      // For wallet authentication, we typically fetch on-chain data or use Ethos API
      // This would be similar to the existing fetchEthosData function
      return {
        user_type: "wallet",
        wallet_address: this.address,
        chain_id: this.chainId,
        // Additional wallet-specific data would go here
      };
    }, 'Failed to fetch wallet user data');
  }

  // Additional wallet-specific methods
  public getAddress(): string | null {
    return this.address;
  }

  public getChainId(): number | null {
    return this.chainId;
  }

  public isOnCorrectChain(expectedChainId: number): boolean {
    return this.chainId === expectedChainId;
  }
}
