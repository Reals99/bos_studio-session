import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    process.env.PAYSTACK_PUBLIC_KEY ||
    "pk_test_1e8c2a41206ed969085cf2124d11bdc89b2785bf";

  return NextResponse.json({ publicKey });
}
