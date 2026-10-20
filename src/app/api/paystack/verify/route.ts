import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Reference parameter is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // If secret key is not set, allow graceful test verification
    if (!secretKey || secretKey.startsWith("sk_test_placeholder")) {
      return NextResponse.json({
        success: true,
        verified: true,
        simulated: true,
        data: {
          reference,
          status: "success",
          gateway_response: "Successful (Simulation)",
        },
      });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status || data.data?.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: data.message || "Payment verification failed with Paystack",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      data: {
        reference: data.data.reference,
        amount: data.data.amount / 100, // converted from pesewas to GHS
        currency: data.data.currency,
        channel: data.data.channel,
        paid_at: data.data.paid_at,
        customer: data.data.customer,
      },
    });
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal payment verification error" },
      { status: 500 }
    );
  }
}
