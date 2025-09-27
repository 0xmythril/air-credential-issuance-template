import { signJwt } from "@/lib/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../../lib/env";
import { verifySessionAccessToken } from "../../auth/common/login";

// =============================================
// TYPE DEFINITIONS
// =============================================

interface UserDataResponse {
  jwt: string;
  response: object;
}

interface EthosApiResponse {
  score?: number;
  level?: string;
  [key: string]: unknown;
}

// =============================================
// CONFIGURATION
// =============================================

const CONFIG = {
  // API endpoints
  ETHOS_BASE_URL: "https://api.ethos.network/api/v2/score/address",
  
  // Test configuration (can be easily switched for test builds)
  TEST_ADDRESS: env.NEXT_PRIVATE_TEST_ADDRESS as string | null, // Set to wallet address for testing, null for production
  // Example: TEST_ADDRESS: "0x1234567890123456789012345678901234567890",
} as const;

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Creates a signed JWT response for user data
 */
const createUserDataResponse = async (data: object): Promise<UserDataResponse> => {
  const jwt = await signJwt({
    partnerId: env.NEXT_PUBLIC_PARTNER_ID,
    scope: "issue",
  });

  return { jwt, response: data };
};

/**
 * Fetches data from Ethos API for the specified address
 */
const fetchEthosData = async (address: string): Promise<EthosApiResponse> => {
  console.log("🔄 Starting Ethos data fetch...");
  console.log(`👤 Target address: ${address}${CONFIG.TEST_ADDRESS ? ' (TEST MODE)' : ''}`);

  try {
    const response = await fetch(`${CONFIG.ETHOS_BASE_URL}?address=${address}`);
    
    if (response.ok) {
      const data = await response.json() as EthosApiResponse;
      console.log("✅ Ethos data fetch complete:", data);
      return data;
    } else {
      console.error(`❌ Failed to fetch Ethos data: ${response.status}`);
      return {};
    }
  } catch (error) {
    console.error("❌ Failed to fetch Ethos data:", error);
    return {};
  }
};

// =============================================
// MAIN API HANDLER
// =============================================

export async function POST(request: NextRequest) {
  const sessionAccessToken = request.headers.get("Authorization");

  if (!sessionAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionAccessTokenResult;
  try {
    sessionAccessTokenResult = await verifySessionAccessToken(sessionAccessToken);
  } catch (error) {
    console.error("Unauthorized", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sub: userId } = sessionAccessTokenResult as { sub: string };

    if (!userId) {
      return NextResponse.json({ error: "user Id not found" }, { status: 400 });
    }

    // Determine effective user ID (test mode override)
    const effectiveUserId = CONFIG.TEST_ADDRESS || userId;

    // Fetch data from Ethos API
    // Current schema used is: { "address": string, "score": integer, "level": string }
    const ethosData = await fetchEthosData(effectiveUserId);

    const responseData = {
      // address: effectiveUserId,
      is_test_address: CONFIG.TEST_ADDRESS ? true : false,
      score: ethosData.score,
      level: ethosData.level,
    };

    return NextResponse.json(await createUserDataResponse(responseData));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}