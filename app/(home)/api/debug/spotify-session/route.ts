import { NextRequest, NextResponse } from "next/server";
import { verifySessionAccessToken } from "../../auth/common/login";

export async function GET(request: NextRequest) {
  const sessionAccessToken = request.headers.get("Authorization");

  if (!sessionAccessToken) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const sessionAccessTokenResult = await verifySessionAccessToken(sessionAccessToken);
    const tokenData = sessionAccessTokenResult as { spotifyAccessToken?: string; type?: string };
    
    return NextResponse.json({
      status: "success",
      decoded_token: sessionAccessTokenResult,
      has_spotify_token: !!tokenData.spotifyAccessToken,
      user_type: tokenData.type || "unknown",
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 400 });
  }
}
