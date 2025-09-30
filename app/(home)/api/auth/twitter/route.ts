import { NextRequest, NextResponse } from "next/server";
import { signJwt } from "@/lib/utils/jwt";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twitterId, username, name, email, twitterAccessToken } = body;

    if (!twitterId) {
      return NextResponse.json(
        { error: "Twitter ID is required" },
        { status: 400 }
      );
    }

    // Create internal access token with Twitter data
    const accessToken = await signJwt({
      partnerId: env.NEXT_PUBLIC_PARTNER_ID,
      scope: "issue",
      sub: twitterId,
      name: name || username || twitterId,
      email: email || `${username}@twitter.com`,
      type: "twitter",
      twitterAccessToken: twitterAccessToken, // Store Twitter access token for API calls (optional for now)
    });

    return NextResponse.json({
      accessToken,
      twitterId,
      username,
    });
  } catch (error) {
    console.error("Error creating Twitter access token:", error);
    return NextResponse.json(
      { error: "Failed to create access token" },
      { status: 500 }
    );
  }
}


