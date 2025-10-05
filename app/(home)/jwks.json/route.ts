import { env } from "@/lib/env";
import { withPrivateKeyHeaders } from "@/lib/utils/jwt";
import * as jose from "jose";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    if (!env.PARTNER_PRIVATE_KEY) {
      throw new Error("Missing PARTNER_PRIVATE_KEY env variable");
    }

    const privateKey = await jose.importPKCS8(
      withPrivateKeyHeaders(env.PARTNER_PRIVATE_KEY),
      env.SIGNING_ALGORITHM,
      { extractable: true }
    );

    const jwk = await jose.exportJWK(privateKey);

    // Remove private key material if present
    const { d, dp, dq, qi, p, q, ...publicJwk } = jwk;

    const jwks = {
      keys: [
        {
          ...publicJwk,
          use: "sig",
          alg: env.SIGNING_ALGORITHM,
          kid: process.env.NEXT_PUBLIC_PARTNER_ID,
        },
      ],
    };

    return NextResponse.json(jwks, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${86400}`, // cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating JWKS:", error);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 }
    );
  }
}
