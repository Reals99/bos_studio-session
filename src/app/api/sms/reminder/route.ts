import { NextResponse } from "next/server";
import { getBookings } from "@/lib/db";
import { send1HourReminderSMS } from "@/lib/sms";

/**
 * Endpoint to trigger 1-hour session reminder SMS prompts.
 * Can be called manually by admin or via a scheduled cron job.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId } = body;

    const bookings = getBookings();

    // If specific bookingId provided, send reminder for that booking
    if (bookingId) {
      const b = bookings.find((item) => item.id.toLowerCase() === bookingId.toLowerCase());
      if (!b) {
        return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
      }

      const res = await send1HourReminderSMS(b.clientPhone, b.clientName, b.timeSlot);
      return NextResponse.json({
        success: true,
        message: `1-Hour reminder SMS dispatched to ${b.clientPhone}`,
        result: res,
      });
    }

    // Otherwise, check all confirmed bookings scheduled for today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter(
      (b) => b.date === todayStr && b.bookingStatus === "confirmed"
    );

    let dispatchedCount = 0;
    for (const b of todayBookings) {
      await send1HourReminderSMS(b.clientPhone, b.clientName, b.timeSlot);
      dispatchedCount++;
    }

    return NextResponse.json({
      success: true,
      todayConfirmedBookings: todayBookings.length,
      dispatchedReminders: dispatchedCount,
      message: `Dispatched ${dispatchedCount} reminders for today's sessions.`,
    });
  } catch (error: any) {
    console.error("Reminder SMS dispatch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch reminders" },
      { status: 500 }
    );
  }
}
