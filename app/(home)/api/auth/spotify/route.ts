import { signJwt } from "@/lib/utils/jwt";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

interface SpotifyAuthRequest {
  spotifyId: string;
  name?: string | null;
  email?: string | null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const spotifyAccessToken = authHeader?.replace("Bearer ", "");

  if (!spotifyAccessToken) {
    return NextResponse.json({ error: "No Spotify access token provided" }, { status: 401 });
  }

  try {
    const { spotifyId, name, email } = await request.json() as SpotifyAuthRequest;

    if (!spotifyId) {
      return NextResponse.json({ error: "Spotify ID is required" }, { status: 400 });
    }

    // Verify the Spotify token by making a request to Spotify API
    const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });

    if (!spotifyResponse.ok) {
      return NextResponse.json({ error: "Invalid Spotify token" }, { status: 401 });
    }

    const spotifyUser = await spotifyResponse.json();

    // Verify the user matches
    if (spotifyUser.id !== spotifyId) {
      return NextResponse.json({ error: "Spotify user mismatch" }, { status: 401 });
    }

    // Generate our internal access token
    const accessToken = await signJwt({
      partnerId: env.NEXT_PUBLIC_PARTNER_ID,
      scope: "issue",
      sub: spotifyId,
      name: name || spotifyUser.display_name || spotifyId,
      email: email || spotifyUser.email,
      type: "spotify",
      spotifyAccessToken: spotifyAccessToken, // Store the Spotify access token
    });

    return NextResponse.json({
      accessToken,
      spotifyId,
      name: name || spotifyUser.display_name,
      email: email || spotifyUser.email,
    });
  } catch (error) {
    console.error("Spotify auth error: Authentication service error");
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify" },
      { status: 500 }
    );
  }
}
