import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/db";

export async function GET() {
  try {
    const metrics = getMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
