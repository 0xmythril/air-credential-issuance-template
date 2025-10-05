import { NextRequest, NextResponse } from "next/server";
import { signJwt } from "@/lib/utils/jwt";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkedinId, name, email, linkedinAccessToken } = body;

    if (!linkedinId) {
      return NextResponse.json(
        { error: "LinkedIn ID is required" },
        { status: 400 }
      );
    }

    // Create internal access token with LinkedIn data
    const accessToken = await signJwt({
      partnerId: env.NEXT_PUBLIC_PARTNER_ID,
      scope: "issue",
      sub: linkedinId,
      name: name || linkedinId,
      email: email || `${linkedinId}@linkedin.com`,
      type: "linkedin",
      linkedinAccessToken: linkedinAccessToken, // Store LinkedIn access token for API calls
    });

    return NextResponse.json({
      accessToken,
      linkedinId,
      name,
      email,
    });
  } catch (error) {
    console.error("Error creating LinkedIn access token:", error);
    return NextResponse.json(
      { error: "Failed to create access token" },
      { status: 500 }
    );
  }
}

