import { NextRequest, NextResponse } from "next/server";
import { signJwt } from "@/lib/utils/jwt";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discordId, username, discriminator, email, discordAccessToken } = body;

    if (!discordId) {
      return NextResponse.json(
        { error: "Discord ID is required" },
        { status: 400 }
      );
    }

    const displayName = username && discriminator !== '0' 
      ? `${username}#${discriminator}` 
      : username || discordId;

    const accessToken = await signJwt({
      partnerId: env.NEXT_PUBLIC_PARTNER_ID,
      scope: "issue",
      sub: discordId,
      name: displayName,
      email: email || `${username}@discord.com`,
      type: "discord",
      discordAccessToken: discordAccessToken, // Store Discord access token for API calls
    });

    return NextResponse.json({
      accessToken,
      discordId,
      username,
    });
  } catch (error) {
    console.error("Error creating Discord access token:", error);
    return NextResponse.json(
      { error: "Failed to create access token" },
      { status: 500 }
    );
  }
}
