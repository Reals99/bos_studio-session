import { NextResponse } from "next/server";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  rescheduleBooking,
} from "@/lib/db";
import { calculatePaymentBreakdown, STUDIO_PACKAGES } from "@/lib/paystack";
import { sendBookingConfirmationSMS, sendRescheduleSMS } from "@/lib/sms";

export async function GET() {
  try {
    const bookings = getBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      packageId,
      paymentMethod,
      date,
      timeSlot,
      notes,
      reference,
    } = body;

    if (!clientName || !clientEmail || !clientPhone || !packageId || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const selectedPkg = STUDIO_PACKAGES.find((p) => p.id === packageId);
    if (!selectedPkg) {
      return NextResponse.json(
        { success: false, error: "Invalid package selected" },
        { status: 400 }
      );
    }

    const { depositAmount, balanceDue } = calculatePaymentBreakdown(
      selectedPkg.price,
      selectedPkg.depositPercent
    );

    const paymentStatus =
      paymentMethod === "paystack" ? "paid_deposit" : "pending_cash";

    const newBooking = createBooking({
      clientName,
      clientEmail,
      clientPhone,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      packagePrice: selectedPkg.price,
      depositAmount,
      balanceDue,
      paymentMethod: paymentMethod || "cash",
      paymentStatus,
      date,
      timeSlot,
      notes: notes || "",
      reference: reference || `REF_${Date.now()}`,
    });

    // Send confirmation SMS to client (async)
    sendBookingConfirmationSMS(
      clientPhone,
      clientName,
      selectedPkg.name,
      date,
      timeSlot,
      newBooking.id
    ).catch((err) => console.error("Confirmation SMS failed:", err));

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "reschedule") {
      const { id, newDate, newTimeSlot, reason } = body;
      if (!id || !newDate || !newTimeSlot) {
        return NextResponse.json(
          { success: false, error: "Missing reschedule parameters (id, newDate, newTimeSlot)" },
          { status: 400 }
        );
      }
      const result = rescheduleBooking(id, newDate, newTimeSlot, reason);
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      // Send rescheduling SMS to client (async)
      sendRescheduleSMS(
        result.booking.clientPhone,
        result.booking.clientName,
        newDate,
        newTimeSlot,
        result.booking.id
      ).catch((err) => console.error("Reschedule SMS failed:", err));

      return NextResponse.json({
        success: true,
        booking: result.booking,
        notification: result.notification,
        message: "Booking rescheduled and SMS notification dispatched.",
      });
    }

    const { id, bookingStatus, paymentStatus } = body;

    if (!id || !bookingStatus) {
      return NextResponse.json(
        { success: false, error: "Missing booking ID or status" },
        { status: 400 }
      );
    }

    const updated = updateBookingStatus(id, bookingStatus, paymentStatus);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
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
        { success: false, error: "Missing booking ID" },
        { status: 400 }
      );
    }

    const deleted = deleteBooking(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
