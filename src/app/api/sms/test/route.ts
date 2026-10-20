import { NextResponse } from "next/server";
import { sendSMS, formatGhanaPhoneNumber } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") || "0240000000";
  return runSmsTest(phone);
}

export async function POST(req: Request) {
  try {
    let phone = "";
    try {
      const body = await req.json();
      phone = body?.phone || "";
    } catch {
      const text = await req.text();
      try {
        phone = JSON.parse(text)?.phone || "";
      } catch {
        phone = "";
      }
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Please provide a recipient phone number" },
        { status: 400 }
      );
    }

    return runSmsTest(phone);
  } catch (error: any) {
    console.error("SMS test error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute SMS test" },
      { status: 500 }
    );
  }
}

async function runSmsTest(phone: string) {
  try {
    const provider = process.env.SMS_PROVIDER || "simulated";
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "Braosei";

    const testMessage = `[Braosei Studios Test] Hello! This is a test SMS from your studio booking system in Takoradi. SMS integration is operational.`;

    const result = await sendSMS({
      to: phone,
      message: testMessage,
    });

    return NextResponse.json({
      success: result.success,
      recipient: formatGhanaPhoneNumber(phone),
      provider,
      senderId,
      hasApiKeyConfigured: Boolean(apiKey && apiKey !== "your_sms_api_key_here"),
      result,
      message: result.success
        ? `Test SMS dispatched successfully to ${phone} via ${provider}.`
        : `SMS dispatch failed: ${result.error}`,
    });
  } catch (error: any) {
    console.error("SMS test error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute SMS test" },
      { status: 500 }
    );
  }
}
