import { useEffect, useState } from "react";
import { useAirkit } from "./useAirkit";

interface AirProviderInfo {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isInitialized: boolean;
  isLoggedIn: boolean;
  userEmail: string | null;
}

/**
 * Custom hook to manage AIR Services provider state and event listeners
 * Uses EIP-1193 standard RPC calls to fetch wallet information
 */
export const useAirProvider = (): AirProviderInfo => {
  const { airService, isInitialized } = useAirkit();
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !airService) {
      setAddress(null);
      setChainId(null);
      setIsLoggedIn(false);
      setUserEmail(null);
      return;
    }

    // Update login state
    setIsLoggedIn(airService.isLoggedIn);

    let provider: unknown = null;
    let handleAccountsChanged: ((...args: unknown[]) => void) | null = null;
    let handleChainChanged: ((...args: unknown[]) => void) | null = null;
    let handleConnect: ((...args: unknown[]) => void) | null = null;
    let handleDisconnect: ((...args: unknown[]) => void) | null = null;

    const fetchProviderInfo = async () => {
      try {
        // Get the provider from AIR Services
        provider = airService.getProvider();
        
        if (provider && typeof (provider as Record<string, unknown>).request === 'function') {
          // Get accounts using standard RPC call
          const providerTyped = provider as { request: (params: { method: string; params: unknown[] }) => Promise<unknown> };
          const accounts = await providerTyped.request({ 
            method: "eth_accounts",
            params: []
          }) as string[];
          
          // Get chain ID using standard RPC call  
          const chainIdHex = await providerTyped.request({ 
            method: "eth_chainId",
            params: []
          }) as string;

          setAddress(accounts[0] || null);
          setChainId(chainIdHex ? parseInt(chainIdHex, 16).toString() : null);

          // Set up event listeners for provider changes
          handleAccountsChanged = (...args: unknown[]) => {
            const accounts = args[0] as string[];
            console.log("AIR Services accounts changed:", accounts);
            setAddress(accounts?.[0] || null);
          };

          handleChainChanged = (...args: unknown[]) => {
            const chainId = args[0] as string;
            console.log("AIR Services chain changed to:", chainId);
            setChainId(chainId ? parseInt(chainId, 16).toString() : null);
          };

          handleConnect = (...args: unknown[]) => {
            console.log("AIR Services wallet connected:", args[0]);
          };

          handleDisconnect = (...args: unknown[]) => {
            console.log("AIR Services wallet disconnected:", args[0]);
            setAddress(null);
            setChainId(null);
          };

          // Add event listeners if provider supports them
          const providerWithEvents = provider as { 
            on?: (event: string, listener: (...args: unknown[]) => void) => void;
            removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
          };
          
          if (typeof providerWithEvents.on === 'function') {
            providerWithEvents.on("accountsChanged", handleAccountsChanged);
            providerWithEvents.on("chainChanged", handleChainChanged);
            providerWithEvents.on("connect", handleConnect);
            providerWithEvents.on("disconnect", handleDisconnect);
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
      const providerWithEvents = provider as { 
        removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
      };
      
      if (provider && typeof providerWithEvents.removeListener === 'function') {
        if (handleAccountsChanged) providerWithEvents.removeListener("accountsChanged", handleAccountsChanged);
        if (handleChainChanged) providerWithEvents.removeListener("chainChanged", handleChainChanged);
        if (handleConnect) providerWithEvents.removeListener("connect", handleConnect);
        if (handleDisconnect) providerWithEvents.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [isInitialized, airService]);

  // Separate effect to monitor login state changes and fetch user info
  useEffect(() => {
    if (!isInitialized || !airService) return;

    const checkLoginStateAndUserInfo = async () => {
      const isLoggedInNow = airService.isLoggedIn;
      setIsLoggedIn(isLoggedInNow);

      if (isLoggedInNow) {
        try {
          const userInfo = await airService.getUserInfo();
          const email = userInfo?.user?.email || null;
          setUserEmail(email);
        } catch (error) {
          console.error("Failed to get user info:", error);
          setUserEmail(null);
        }
      } else {
        setUserEmail(null);
      }
    };

    // Check login state immediately
    checkLoginStateAndUserInfo();

    // Poll for login state changes every 1 second
    const interval = setInterval(checkLoginStateAndUserInfo, 1000);

    return () => clearInterval(interval);
  }, [isInitialized, airService]);

  return {
    address,
    chainId,
    isConnected: !!address,
    isInitialized,
    isLoggedIn,
    userEmail
  };
};
