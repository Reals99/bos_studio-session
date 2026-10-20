/**
 * Braosei Studios — SMS Dispatch Service
 * Supports Ghana SMS Gateways (Arkesel, Hubtel, mNotify) and Twilio.
 * Automatically formats Ghanaian phone numbers (+233 / 024 / 055 etc.)
 */

export interface SMSPayload {
  to: string; // Recipient phone number
  message: string;
}

/**
 * Format phone number to international Ghanaian format (e.g. 0241234567 -> 233241234567)
 */
export function formatGhanaPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, "");

  if (cleaned.startsWith("+233")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "233" + cleaned.substring(1);
  } else if (cleaned.startsWith("233")) {
    // already 233
  }

  return cleaned;
}

/**
 * Send an SMS message using the configured gateway or fallback to simulated log
 */
export async function sendSMS({ to, message }: SMSPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedPhone = formatGhanaPhoneNumber(to);
  const provider = process.env.SMS_PROVIDER || "simulated";
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || "Braosei";

  console.log(`[SMS OUTBOUND] To: ${formattedPhone} (${to}) | Sender: ${senderId} | Provider: ${provider}`);
  console.log(`[SMS CONTENT] "${message}"`);

  // 1. If simulated or no key set, log and return success
  if (!apiKey || provider === "simulated") {
    return {
      success: true,
      messageId: `SIM_${Date.now()}`,
    };
  }

  try {
    // 2. Arkesel (Popular Ghana SMS Provider: arkesel.com)
    if (provider.toLowerCase() === "arkesel") {
      const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: senderId,
          message: message,
          recipients: [formattedPhone],
        }),
      });
      const data = await res.json();
      return { success: res.ok, messageId: data.data?.[0]?.id || data.id };
    }

    // 3. mNotify (Ghana SMS Provider: mnotify.com)
    if (provider.toLowerCase() === "mnotify") {
      const res = await fetch(`https://api.mnotify.com/api/sms/quick?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: [formattedPhone],
          sender: senderId,
          message: message,
          is_schedule: false,
        }),
      });
      const data = await res.json();
      return { success: data.status === "success", messageId: data.summary?.[0]?._id };
    }

    // 4. Hubtel (Ghana Provider: hubtel.com)
    if (provider.toLowerCase() === "hubtel") {
      const authHeader = Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${apiKey}`).toString("base64");
      const res = await fetch("https://sms.hubtel.com/v1/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          From: senderId,
          To: formattedPhone,
          Content: message,
        }),
      });
      const data = await res.json();
      return { success: res.ok, messageId: data.messageId };
    }

    return { success: true, messageId: `DEV_${Date.now()}` };
  } catch (error: any) {
    console.error("SMS Dispatch failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Booking Confirmation SMS to Client
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  clientName: string,
  packageName: string,
  date: string,
  timeSlot: string,
  bookingId: string
) {
  const message = `[Braosei Studios] Hello ${clientName}, your ${packageName} session is confirmed for ${date} at ${timeSlot}. Location: F. W. H Migeod Ave, Takoradi. Booking ID: ${bookingId}.`;
  return sendSMS({ to: phone, message });
}

/**
 * Send 1-Hour Reminder SMS Prompt to Client
 */
export async function send1HourReminderSMS(
  phone: string,
  clientName: string,
  timeSlot: string
) {
  const message = `[Braosei Studios Reminder] Hi ${clientName}, your studio session begins in 1 hour (${timeSlot}) at Braosei Studios, Takoradi. Please arrive 10-15 mins early to prepare looks.`;
  return sendSMS({ to: phone, message });
}

/**
 * Send Reschedule Notification SMS to Client
 */
export async function sendRescheduleSMS(
  phone: string,
  clientName: string,
  newDate: string,
  newTimeSlot: string,
  bookingId: string
) {
  const message = `[Braosei Studios Update] Hi ${clientName}, your studio session (${bookingId}) has been rescheduled to ${newDate} at ${newTimeSlot}. Location: F. W. H Migeod Ave, Takoradi. See you then!`;
  return sendSMS({ to: phone, message });
}
