import axios from "axios";
import { useSession, SessionType } from "../hooks/useSession";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Helper to determine auth method from current path
const getAuthMethodFromPath = (): SessionType => {
  if (typeof window === "undefined") return "wallet";
  
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment === 'spotify') return 'spotify';
  if (firstSegment === 'twitter') return 'twitter';
  if (firstSegment === 'discord') return 'discord';
  if (firstSegment === 'linkedin') return 'linkedin';
  if (firstSegment === 'ethos' || firstSegment === 'wallet') return 'wallet';
  if (firstSegment === 'airkit') return 'airkit';
  
  return 'wallet'; // Default
};

axiosInstance.interceptors.request.use((config) => {
  const authMethod = getAuthMethodFromPath();
  const sessionStore = useSession.getState();
  const currentSession = sessionStore.getSession(authMethod);
  const accessToken = currentSession.accessToken;
  
  console.log("🔧 [Axios Interceptor] Auth method:", authMethod);
  console.log("🔧 [Axios Interceptor] Access token exists:", !!accessToken);
  
  if (accessToken) {
    config.headers.Authorization = accessToken;
  }
  return config;
});
