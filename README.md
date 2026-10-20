# Braosei Studios — Session Booking System & Admin CRM

A Next.js (React) studio session booking platform for **Braosei Studios** (Accra, Ghana). Built with Tailwind CSS, TypeScript, Paystack 30% deposit checkout integration, and an Admin Operations Dashboard with CRM.

---

## 📸 Key Features

### 1. Client-Facing Booking Website (`/(client)`)
- **Landing Page (`/`)**:
  - High-end dark studio aesthetic with champagne gold accents.
  - Transparent packages breakdown:
    - **Entry**: Ghc 300 (1 Hour, 5 Retouched Photos, 1 Look)
    - **Standard**: Ghc 550 (2 Hours, 10 Retouched Photos, 2 Looks, All RAW Previews)
    - **Premium**: Ghc 1,000 (3 Hours, 20 Retouched Photos, 4K BTS Reel)
    - **Super Pack**: Ghc 2,000 (Full Day / 6 Hours Buyout, 40 Edits, 3 Reels, VIP Host)
  - Studio equipment specifications (Sony FX Cinema series, Aputure & Godox lighting, acoustic isolation, green room).
  - Production FAQ & direct WhatsApp contact.
- **Booking Flow (`/book`)**:
  - Package selector with 30% deposit previews.
  - **Date & Time Scroller (`DateScroller.tsx`)**: 30-day horizontal date ribbon and dynamic time slot selector (`09:00 AM`, `11:30 AM`, `02:00 PM`, `04:30 PM`, `07:00 PM`).
  - Automatic graying out of admin-blocked slots.
  - **Payment Options**:
    - **Paystack (30% Deposit)**: Automatic calculation (e.g. Ghc 165 deposit for Standard package, balance Ghc 385 due at studio).
    - **Cash Booking**: Instant slot reservation with full payment due on arrival.
  - Confirmation screen with booking ID (e.g., `BOS-4019`), summary receipt, and one-click WhatsApp studio confirmation.

### 2. Secure Admin Operations & CRM (`/(admin)`)
- **Protected Layout (`(admin)/layout.tsx`)**:
  - PIN protection wall (**Default Demo PIN: `1234`**).
  - Persistent session memory in browser.
- **Admin Dashboard (`/admin`)**:
  - Real-time **Metrics Cards**: Total Bookings, Total Studio Revenue, 30% Deposits Collected, Upcoming Shoots.
  - **Visual Calendar & Slot Blockout**: Interactive grid to lock/unlock slots for maintenance, private VIP buyouts, or off-days.
  - **Booking Table**: Filterable by client name, ID, or status (`Confirmed`, `Completed`, `Cancelled`). Includes direct WhatsApp links for client outreach.
- **CRM Database (`/admin/crm`)**:
  - Track client history, Lifetime Value (LTV in Ghc), shoot counts, and client tier badges (`VIP`, `Regular`, `New`).
  - Private studio notes editor (lighting preferences, mood boards, music tastes).

---

## 🗂️ Exact Folder Structure

```
/src
  /app
    layout.tsx            // Root layout & metadata
    globals.css           // Tailwind styles & studio themes
    /(client)
      page.tsx            // Landing page & Packages
      book/page.tsx       // Booking flow & Date scroller
    /(admin)
      layout.tsx          // Protected Admin Layout (PIN Auth)
      admin/page.tsx      // Dashboard (Metrics, Calendar Blockout, Bookings)
      admin/crm/page.tsx  // CRM Database (Client history, LTV, notes)
    /api
      /bookings/route.ts  // GET, POST, PATCH, DELETE for bookings
      /blocks/route.ts    // GET, POST, DELETE for calendar blocks
      /clients/route.ts   // GET, PATCH for CRM client database
      /metrics/route.ts   // GET studio performance metrics
  /components
    /client
      PricingCard.tsx     // Package display card with deposit math
      DateScroller.tsx    // Dynamic horizontal date ribbon & slots
    /admin
      MetricsCard.tsx     // Revenue, booking, and upcoming metrics
      BookingTable.tsx    // Booking table with WhatsApp links & status toggles
      ClientList.tsx      // Client CRM list with LTV and editable notes
  /lib
    paystack.ts           // Paystack 30% deposit logic, popup trigger & GHS formatting
    db.ts                 // Persistent database store & realistic seed records
```

---

## 🚀 Running the Project

### 1. Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Client Booking: [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/book](http://localhost:3000/book)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin) (PIN: `1234`)
- Admin CRM: [http://localhost:3000/admin/crm](http://localhost:3000/admin/crm)

### 2. Production Build
```bash
npm.cmd run build
npm.cmd start
```

### 3. Paystack Configuration (Optional)
To use your live or test Paystack public key, create a `.env.local` file:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
*(If no key is configured, the application automatically runs in demo checkout mode for instant zero-friction testing).*
