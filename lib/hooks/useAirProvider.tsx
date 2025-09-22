import { useEffect, useState } from "react";
import { useAirkit } from "./useAirkit";

interface AirProviderInfo {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isInitialized: boolean;
}

/**
 * Custom hook to manage AIR Services provider state and event listeners
 * Uses EIP-1193 standard RPC calls to fetch wallet information
 */
export const useAirProvider = (): AirProviderInfo => {
  const { airService, isInitialized } = useAirkit();
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !airService) {
      setAddress(null);
      setChainId(null);
      return;
    }

    let provider: any = null;
    let handleAccountsChanged: ((accounts: string[]) => void) | null = null;
    let handleChainChanged: ((chainId: string) => void) | null = null;
    let handleConnect: ((connectInfo: any) => void) | null = null;
    let handleDisconnect: ((error: any) => void) | null = null;

    const fetchProviderInfo = async () => {
      try {
        // Get the provider from AIR Services
        provider = airService.getProvider();
        
        if (provider && typeof provider.request === 'function') {
          // Get accounts using standard RPC call
          const accounts = await provider.request({ 
            method: "eth_accounts",
            params: []
          }) as string[];
          
          // Get chain ID using standard RPC call  
          const chainIdHex = await provider.request({ 
            method: "eth_chainId",
            params: []
          }) as string;

          setAddress(accounts[0] || null);
          setChainId(chainIdHex ? parseInt(chainIdHex, 16).toString() : null);

          // Set up event listeners for provider changes
          handleAccountsChanged = (accounts: string[]) => {
            console.log("AIR Services accounts changed:", accounts);
            setAddress(accounts[0] || null);
          };

          handleChainChanged = (chainId: string) => {
            console.log("AIR Services chain changed to:", chainId);
            setChainId(parseInt(chainId, 16).toString());
          };

          handleConnect = (connectInfo: any) => {
            console.log("AIR Services wallet connected:", connectInfo);
          };

          handleDisconnect = (error: any) => {
            console.log("AIR Services wallet disconnected:", error);
            setAddress(null);
            setChainId(null);
          };

          // Add event listeners if provider supports them
          if (typeof provider.on === 'function') {
            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("connect", handleConnect);
            provider.on("disconnect", handleDisconnect);
          }
        }
      } catch (error) {
        console.error("Failed to fetch AIR Services provider info:", error);
        setAddress(null);
        setChainId(null);
      }
    };

    fetchProviderInfo();

    // Cleanup function
    return () => {
      if (provider && typeof provider.removeListener === 'function') {
        if (handleAccountsChanged) provider.removeListener("accountsChanged", handleAccountsChanged);
        if (handleChainChanged) provider.removeListener("chainChanged", handleChainChanged);
        if (handleConnect) provider.removeListener("connect", handleConnect);
        if (handleDisconnect) provider.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [isInitialized, airService]);

  return {
    address,
    chainId,
    isConnected: !!address,
    isInitialized
  };
};
