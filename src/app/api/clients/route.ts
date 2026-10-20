import { NextResponse } from "next/server";
import { getClients, updateClientNotes, updateClientTier } from "@/lib/db";

export async function GET() {
  try {
    const clients = getClients();
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, notes, tier } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing client ID" },
        { status: 400 }
      );
    }

    if (tier !== undefined) {
      const updated = updateClientTier(id, tier);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Client not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, client: updated });
    }

    if (notes !== undefined) {
      const updated = updateClientNotes(id, notes);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Client not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, client: updated });
    }

    return NextResponse.json(
      { success: false, error: "Provide notes or tier to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update client:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client" },
      { status: 500 }
    );
  }
}
