import { env } from "@/lib/env";
import { withPrivateKeyHeaders } from "@/lib/utils/jwt";
import * as jose from "jose";
import { createPrivateKey, createPublicKey } from "crypto";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const privateKeyObject = createPrivateKey({
      key: withPrivateKeyHeaders(env.PARTNER_PRIVATE_KEY),
      format: "pem",
      type: "pkcs8",
    });

    const publicKeyObject = createPublicKey(privateKeyObject);
    const jwk = await jose.exportJWK(publicKeyObject);

    const jwks = {
      keys: [
        {
          ...jwk,
          use: "sig",
          alg: env.SIGNING_ALGORITHM,
          kid: env.NEXT_PUBLIC_PARTNER_ID,
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
