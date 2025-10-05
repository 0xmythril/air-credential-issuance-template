import { env } from "@/lib/env";
import { withPrivateKeyHeaders } from "@/lib/utils/jwt";
import { createPublicKey, createPrivateKey } from "crypto";
import * as jose from "jose";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const privateKeyPem = withPrivateKeyHeaders(env.PARTNER_PRIVATE_KEY);

    // Import private key using Node crypto so we can derive the public key
    const privateKey = createPrivateKey({
      key: privateKeyPem,
      format: "pem",
      type: "pkcs8",
    });

    const publicKey = createPublicKey(privateKey);

    // Export the public JWK (no private components)
    const jwk = await jose.exportJWK(publicKey);

    const jwks = {
      keys: [
        {
          ...jwk,
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
