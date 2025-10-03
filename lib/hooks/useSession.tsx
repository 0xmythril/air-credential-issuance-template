import { cookieStorage } from "wagmi";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SessionType = "spotify" | "twitter" | "discord" | "wallet" | "airkit";

interface SessionData {
  accessToken: string | null;
  userName?: string;
  userEmail?: string;
}

interface MultiSessionStore {
  sessions: Record<SessionType, SessionData>;
  setSession: (type: SessionType, data: SessionData) => void;
  clearSession: (type: SessionType) => void;
  getSession: (type: SessionType) => SessionData;
  
  // Legacy compatibility
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const useSession = create<MultiSessionStore>()(
  persist(
    (set, get) => ({
      sessions: {
        spotify: { accessToken: null },
        twitter: { accessToken: null },
        discord: { accessToken: null },
        wallet: { accessToken: null },
        airkit: { accessToken: null },
      },
      
      setSession: (type: SessionType, data: SessionData) => 
        set((state) => ({
          sessions: {
            ...state.sessions,
            [type]: data,
          },
        })),
      
      clearSession: (type: SessionType) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [type]: { accessToken: null },
          },
        })),
      
      getSession: (type: SessionType) => get().sessions[type],
      
      // Legacy compatibility - uses wallet session by default
      accessToken: null,
      setAccessToken: (accessToken: string | null) => 
        set((state) => ({
          accessToken,
          sessions: {
            ...state.sessions,
            wallet: { accessToken },
          },
        })),
    }),
    {
      name: "air.issuer-template.multi-session",
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
