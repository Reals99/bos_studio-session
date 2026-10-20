import fs from "fs";
import path from "path";

export interface Booking {
  id: string; // e.g., "BOS-9182"
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
  balanceDue: number;
  paymentMethod: "paystack" | "cash";
  paymentStatus: "paid_deposit" | "paid_full" | "pending_cash" | "refunded";
  bookingStatus: "confirmed" | "completed" | "cancelled" | "pending";
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM"
  notes?: string;
  reference?: string;
  createdAt: string;
  rescheduledAt?: string;
  rescheduleReason?: string;
  confirmationEmailSent?: boolean;
  reminderSmsScheduled?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lifetimeValue: number; // in GHS
  firstSeen: string;
  lastBookingDate: string;
  notes: string;
  tier: "VIP" | "Regular" | "New";
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "ALL_DAY" or specific time like "09:00 AM"
  reason: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  bookingId: string;
  type: "email_confirmation" | "sms_1hr_reminder" | "sms_reschedule";
  recipient: string;
  message: string;
  status: "sent" | "scheduled";
  scheduledFor?: string;
  sentAt: string;
}

interface DatabaseSchema {
  bookings: Booking[];
  clients: Client[];
  blockedSlots: BlockedSlot[];
  notifications: NotificationLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "studio_db.json");

// Default initial seed data for Braosei Studios (Takoradi, Ghana)
const INITIAL_DATA: DatabaseSchema = {
  bookings: [
    {
      id: "BOS-4019",
      clientName: "Kwame Mensah",
      clientEmail: "kwame.mensah@gmail.com",
      clientPhone: "+233 24 555 1029",
      packageId: "standard",
      packageName: "Standard",
      packagePrice: 550,
      depositAmount: 165,
      balanceDue: 385,
      paymentMethod: "paystack",
      paymentStatus: "paid_deposit",
      bookingStatus: "confirmed",
      date: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
      timeSlot: "11:00 AM",
      notes: "Music artist promo shoot. Requested Video Reel add-on.",
      reference: "PSTK_KWAME_9102",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      confirmationEmailSent: true,
      reminderSmsScheduled: true,
    },
    {
      id: "BOS-3982",
      clientName: "Abena Serwaa",
      clientEmail: "abena.s@creatives.gh",
      clientPhone: "+233 50 123 4892",
      packageId: "premium",
      packageName: "Premium",
      packagePrice: 1000,
      depositAmount: 300,
      balanceDue: 700,
      paymentMethod: "paystack",
      paymentStatus: "paid_deposit",
      bookingStatus: "confirmed",
      date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      timeSlot: "02:00 PM",
      notes: "Fashion lookbook with 3 outfits in Takoradi studio.",
      reference: "PSTK_ABENA_4821",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      confirmationEmailSent: true,
      reminderSmsScheduled: true,
    },
    {
      id: "BOS-3840",
      clientName: "Nana Osei Bonsu",
      clientEmail: "nana.osei@brao.com",
      clientPhone: "+233 20 892 3311",
      packageId: "super",
      packageName: "Super Pack",
      packagePrice: 2000,
      depositAmount: 600,
      balanceDue: 1400,
      paymentMethod: "cash",
      paymentStatus: "pending_cash",
      bookingStatus: "confirmed",
      date: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
      timeSlot: "09:00 AM",
      notes: "Super Pack shoot. Hair & makeup arriving at 8:30 AM.",
      reference: "CASH_RESERVE_8291",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      confirmationEmailSent: true,
      reminderSmsScheduled: true,
    },
    {
      id: "BOS-3711",
      clientName: "Efua Darko",
      clientEmail: "efua.darko@outlook.com",
      clientPhone: "+233 55 412 9003",
      packageId: "entry",
      packageName: "Entry",
      packagePrice: 300,
      depositAmount: 90,
      balanceDue: 210,
      paymentMethod: "paystack",
      paymentStatus: "paid_deposit",
      bookingStatus: "completed",
      date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      timeSlot: "04:30 PM",
      notes: "Corporate executive headshots for LinkedIn & PR.",
      reference: "PSTK_EFUA_7719",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      confirmationEmailSent: true,
      reminderSmsScheduled: true,
    },
  ],
  clients: [
    {
      id: "cli_1",
      name: "Kwame Mensah",
      email: "kwame.mensah@gmail.com",
      phone: "+233 24 555 1029",
      totalBookings: 2,
      lifetimeValue: 1100,
      firstSeen: "2025-11-14",
      lastBookingDate: "2026-10-20",
      notes: "High energy musician. Always requests high-contrast lighting.",
      tier: "Regular",
    },
    {
      id: "cli_2",
      name: "Abena Serwaa",
      email: "abena.s@creatives.gh",
      phone: "+233 50 123 4892",
      totalBookings: 3,
      lifetimeValue: 2550,
      firstSeen: "2025-08-01",
      lastBookingDate: "2026-10-21",
      notes: "Founder of fashion brand. Very punctual. VIP status.",
      tier: "VIP",
    },
    {
      id: "cli_3",
      name: "Nana Osei Bonsu",
      email: "nana.osei@brao.com",
      phone: "+233 20 892 3311",
      totalBookings: 1,
      lifetimeValue: 2000,
      firstSeen: "2026-10-10",
      lastBookingDate: "2026-10-23",
      notes: "VIP Client. Full commercial shoot in Takoradi.",
      tier: "VIP",
    },
    {
      id: "cli_4",
      name: "Efua Darko",
      email: "efua.darko@outlook.com",
      phone: "+233 55 412 9003",
      totalBookings: 1,
      lifetimeValue: 300,
      firstSeen: "2026-10-15",
      lastBookingDate: "2026-10-16",
      notes: "Professional headshots.",
      tier: "New",
    },
  ],
  blockedSlots: [
    {
      id: "blk_1",
      date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      timeSlot: "09:00 AM",
      reason: "Studio Maintenance / Calibration",
      createdAt: new Date().toISOString(),
    },
  ],
  notifications: [],
};

let memoryStore: DatabaseSchema = JSON.parse(JSON.stringify(INITIAL_DATA));

function ensureDataDirectory() {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DATA, null, 2), "utf8");
    }
  } catch {
    // Graceful fallback
  }
}

function readData(): DatabaseSchema {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (!parsed.notifications) parsed.notifications = [];
      return parsed;
    }
  } catch (err) {
    console.error("DB read error, using memory store:", err);
  }
  return memoryStore;
}

function writeData(data: DatabaseSchema) {
  memoryStore = data;
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("DB write error, saved in memory:", err);
  }
}

export function getBookings(): Booking[] {
  const db = readData();
  return db.bookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getBookingById(id: string): Booking | undefined {
  const db = readData();
  return db.bookings.find((b) => b.id.toLowerCase() === id.toLowerCase());
}

export function createBooking(
  bookingData: Omit<Booking, "id" | "createdAt" | "bookingStatus" | "confirmationEmailSent" | "reminderSmsScheduled">
): Booking {
  const db = readData();
  const id = `BOS-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: Booking = {
    ...bookingData,
    id,
    bookingStatus: "confirmed",
    createdAt: new Date().toISOString(),
    confirmationEmailSent: true,
    reminderSmsScheduled: true,
  };

  db.bookings.unshift(newBooking);

  // 1. Email notification log
  db.notifications.push({
    id: `notif_${Date.now()}_1`,
    bookingId: id,
    type: "email_confirmation",
    recipient: bookingData.clientEmail,
    message: `Dear ${bookingData.clientName}, your session for ${bookingData.packageName} on ${bookingData.date} at ${bookingData.timeSlot} at Braosei Studios (F. W. H Migeod Avenue, Takoradi) is confirmed. Reference ID: ${id}.`,
    status: "sent",
    sentAt: new Date().toISOString(),
  });

  // 2. 1-Hour Reminder SMS log
  db.notifications.push({
    id: `notif_${Date.now()}_2`,
    bookingId: id,
    type: "sms_1hr_reminder",
    recipient: bookingData.clientPhone,
    message: `[Braosei Studios Reminder] Hi ${bookingData.clientName}, your photography session is scheduled in 1 hour (${bookingData.timeSlot}) today at Braosei Studios (F. W. H Migeod Avenue, Takoradi). Please arrive 15 mins early.`,
    status: "scheduled",
    scheduledFor: `${bookingData.date} 1-hour-prior`,
    sentAt: new Date().toISOString(),
  });

  // Sync or update client CRM record
  const existingClient = db.clients.find(
    (c) =>
      c.email.toLowerCase() === bookingData.clientEmail.toLowerCase() ||
      c.phone.replace(/\s+/g, "") === bookingData.clientPhone.replace(/\s+/g, "")
  );

  if (existingClient) {
    existingClient.totalBookings += 1;
    existingClient.lifetimeValue += bookingData.packagePrice;
    existingClient.lastBookingDate = bookingData.date;
    if (existingClient.lifetimeValue >= 2000 && existingClient.tier !== "VIP") {
      existingClient.tier = "VIP";
    }
  } else {
    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name: bookingData.clientName,
      email: bookingData.clientEmail,
      phone: bookingData.clientPhone,
      totalBookings: 1,
      lifetimeValue: bookingData.packagePrice,
      firstSeen: bookingData.date,
      lastBookingDate: bookingData.date,
      notes: bookingData.notes ? `Initial notes: ${bookingData.notes}` : "Booked online.",
      tier: bookingData.packagePrice >= 2000 ? "VIP" : "New",
    };
    db.clients.unshift(newClient);
  }

  writeData(db);
  return newBooking;
}

export function rescheduleBooking(
  id: string,
  newDate: string,
  newTimeSlot: string,
  reason?: string
): { booking: Booking; notification: NotificationLog } | null {
  const db = readData();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  const oldDate = booking.date;
  const oldSlot = booking.timeSlot;

  booking.date = newDate;
  booking.timeSlot = newTimeSlot;
  booking.rescheduledAt = new Date().toISOString();
  booking.rescheduleReason = reason || "Schedule revised by Studio Management";

  // Trigger SMS notification to client
  const smsMessage = `[Braosei Studios Update] Hi ${booking.clientName}, your photography session (ID: ${booking.id}) has been rescheduled from ${oldDate} ${oldSlot} to: ${newDate} at ${newTimeSlot}. Studio location: F. W. H Migeod Avenue, Takoradi. Note: Unscheduled rescheduling attracts an administrative fee. See you then!`;

  const newNotif: NotificationLog = {
    id: `notif_${Date.now()}_resched`,
    bookingId: booking.id,
    type: "sms_reschedule",
    recipient: booking.clientPhone,
    message: smsMessage,
    status: "sent",
    sentAt: new Date().toISOString(),
  };

  db.notifications.push(newNotif);
  writeData(db);
  return { booking, notification: newNotif };
}

export function updateBookingStatus(
  id: string,
  bookingStatus: Booking["bookingStatus"],
  paymentStatus?: Booking["paymentStatus"]
): Booking | null {
  const db = readData();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  booking.bookingStatus = bookingStatus;
  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }
  writeData(db);
  return booking;
}

export function deleteBooking(id: string): boolean {
  const db = readData();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  db.bookings.splice(idx, 1);
  writeData(db);
  return true;
}

export function getBlockedSlots(): BlockedSlot[] {
  const db = readData();
  return db.blockedSlots;
}

export function addBlockedSlot(date: string, timeSlot: string, reason: string): BlockedSlot {
  const db = readData();
  const newBlock: BlockedSlot = {
    id: `blk_${Date.now()}`,
    date,
    timeSlot,
    reason: reason || "Studio Unavailable / Blocked by Admin",
    createdAt: new Date().toISOString(),
  };
  db.blockedSlots.push(newBlock);
  writeData(db);
  return newBlock;
}

export function removeBlockedSlot(id: string): boolean {
  const db = readData();
  const idx = db.blockedSlots.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  db.blockedSlots.splice(idx, 1);
  writeData(db);
  return true;
}

export function getClients(): Client[] {
  const db = readData();
  return db.clients.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
}

export function updateClientNotes(id: string, notes: string): Client | null {
  const db = readData();
  const client = db.clients.find((c) => c.id === id);
  if (!client) return null;
  client.notes = notes;
  writeData(db);
  return client;
}

export function updateClientTier(id: string, tier: Client["tier"]): Client | null {
  const db = readData();
  const client = db.clients.find((c) => c.id === id);
  if (!client) return null;
  client.tier = tier;
  writeData(db);
  return client;
}

export function getNotifications(): NotificationLog[] {
  const db = readData();
  return db.notifications.sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function getMetrics() {
  const db = readData();
  const totalBookings = db.bookings.length;
  
  const totalRevenue = db.bookings.reduce((sum, b) => {
    return sum + b.packagePrice;
  }, 0);

  const depositsCollected = db.bookings.reduce((sum, b) => {
    if (b.paymentStatus === "paid_deposit" || b.paymentStatus === "paid_full") {
      return sum + b.depositAmount;
    }
    return sum;
  }, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingShoots = db.bookings.filter(
    (b) => b.bookingStatus === "confirmed" && b.date >= todayStr
  ).length;

  const activeClients = db.clients.length;

  return {
    totalBookings,
    totalRevenue,
    depositsCollected,
    upcomingShoots,
    activeClients,
  };
}
