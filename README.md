# ✈ FlightApp — Flight Management PWA

A responsive, production-like flight management web app where passengers can search and book flights, select seats, reschedule, and cancel bookings.

**Live URL:** https://flightmanagementapp.netlify.app/

---

## Tech Stack

- **Frontend & API:** Next.js 14+ (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Realtime)
- **State Management:** Zustand with persist middleware
- **Styling:** Tailwind CSS
- **PWA:** next-pwa

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Onyinye-Maggie/Flight-App
cd flight-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run the migration files in order:
  1. `supabase/migrations/001_create_tables.sql`
  2. `supabase/migrations/002_rls_policies.sql`
  3. `supabase/migrations/003_functions.sql`
  4. `supabase/migrations/004_seed.sql`
- Go to **Authentication → Providers → Email** and disable **Confirm email** for testing
- Go to **Database → Publications → supabase_realtime** and enable the `seats` table

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Account

Use these credentials to log in and test the app:

```
Email:    test@flightapp.com
Password: test123456
```

---

## Supabase Project Config

- **Region:** EU West
- **Auth:** Email/password (email confirmation disabled for testing)
- **Realtime:** Enabled on `seats` table
- **RLS:** Enabled on all tables

---

## Database Schema

| Table | Description |
|-------|-------------|
| `flights` | Flight details, routes, pricing |
| `seats` | Seat map per flight with class and availability |
| `bookings` | User bookings with PNR codes |
| `passengers` | Passenger details per booking |
| `reschedules` | Reschedule history per booking |

---

## Zustand Store Structure

### `useFlightStore` (persisted)

Manages the active booking journey.

| Field | Persisted | Notes |
|-------|-----------|-------|
| `searchQuery` | ✅ Yes | Saved so users can resume after closing tab |
| `selectedFlight` | ✅ Yes | Saved for in-progress booking |
| `selectedSeat` | ✅ Yes | Saved for in-progress booking |
| `currentStep` | ✅ Yes | Tracks booking progress |
| `passengerForm` | ❌ No | Excluded — contains sensitive data |

**`partialize`** is used to explicitly exclude `passengerForm` from localStorage. Passport numbers are never stored in the Zustand store at all — they live only in local component state during form entry and are sent directly to the Supabase RPC.

### `useUserStore` (persisted)

Manages auth session and cached bookings.

| Field | Persisted | Notes |
|-------|-----------|-------|
| `sessionToken` | ✅ Yes | Only the session token is persisted |
| `cachedBookings` | ❌ No | Excluded — fetched fresh each time |

Both stores expose a `reset` action that is triggered on logout and on booking cancellation.

---

## Key Features

- **Seat locking RPC** — prevents double-booking race conditions using `FOR UPDATE` row locking
- **Realtime seat map** — seats booked by other users update live via Supabase Realtime
- **2-hour cancellation rule** — enforced at DB level via a trigger on the `bookings` table
- **Atomic cancellation** — cancels booking and frees seat in a single RPC call
- **PWA** — installable, offline fallback page, StaleWhileRevalidate for flight data

---

## Trade-offs & What I Would Do Differently

- **Reschedule UI** — The reschedule flow currently directs users to search for a new flight manually. Given more time, I would build a dedicated reschedule modal that fetches alternative flights on the same route and inserts into the `reschedules` table automatically.
- **Passenger count** — The current flow supports one passenger per booking. With more time I would loop the booking form for multiple passengers and link them all to one booking.
- **Error boundaries** — I would add React error boundaries around key sections for more graceful error handling.
- **Testing** — I would add unit tests for the Zustand stores and integration tests for the booking flow.