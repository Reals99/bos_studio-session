import { NextResponse } from "next/server";
import { getBlockedSlots, addBlockedSlot, removeBlockedSlot } from "@/lib/db";

export async function GET() {
  try {
    const blocks = getBlockedSlots();
    return NextResponse.json({ success: true, blocks });
  } catch (error) {
    console.error("Failed to fetch blocked slots:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blocked slots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, timeSlot, reason } = body;

    if (!date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing date or timeSlot" },
        { status: 400 }
      );
    }

    const block = addBlockedSlot(date, timeSlot, reason || "Blocked by Admin");
    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("Failed to add block:", error);
    return NextResponse.json(
      { success: false, error: "Failed to block slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing block ID" },
        { status: 400 }
      );
    }

    const removed = removeBlockedSlot(id);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error("Failed to remove block:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove block" },
      { status: 500 }
    );
  }
}
