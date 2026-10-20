import { NextResponse } from "next/server";
import { checkSMSBalance } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkSMSBalance();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch SMS balance" },
      { status: 500 }
    );
  }
}
