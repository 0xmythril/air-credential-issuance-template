import { NextRequest, NextResponse } from "next/server";
import { verifySessionAccessToken } from "../../auth/common/login";

export async function GET(request: NextRequest) {
  const sessionAccessToken = request.headers.get("Authorization");

  if (!sessionAccessToken) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 });
  }

  try {
    const sessionAccessTokenResult = await verifySessionAccessToken(sessionAccessToken);
    
    return NextResponse.json({
      status: "success",
      decoded_token: sessionAccessTokenResult,
      has_spotify_token: !!(sessionAccessTokenResult as any).spotifyAccessToken,
      user_type: (sessionAccessTokenResult as any).type || "unknown",
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 400 });
  }
}
