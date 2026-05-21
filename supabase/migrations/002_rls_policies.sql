-- Enable RLS on all tables
alter table flights enable row level security;
alter table seats enable row level security;
alter table bookings enable row level security;
alter table passengers enable row level security;
alter table reschedules enable row level security;

-- FLIGHTS: anyone can view flights
create policy "flights_public_read" on flights
  for select using (true);

-- SEATS: anyone can view seats
create policy "seats_public_read" on seats
  for select using (true);

-- BOOKINGS: users can only see their own bookings
create policy "bookings_select_own" on bookings
  for select using (auth.uid() = user_id);

create policy "bookings_insert_own" on bookings
  for insert with check (auth.uid() = user_id);

create policy "bookings_update_own" on bookings
  for update using (auth.uid() = user_id);

-- PASSENGERS: users can only see passengers tied to their bookings
create policy "passengers_select_own" on passengers
  for select using (
    exists (
      select 1 from bookings
      where bookings.id = passengers.booking_id
      and bookings.user_id = auth.uid()
    )
  );

create policy "passengers_insert_own" on passengers
  for insert with check (
    exists (
      select 1 from bookings
      where bookings.id = passengers.booking_id
      and bookings.user_id = auth.uid()
    )
  );

-- RESCHEDULES: users can only see their own reschedules
create policy "reschedules_select_own" on reschedules
  for select using (
    exists (
      select 1 from bookings
      where bookings.id = reschedules.booking_id
      and bookings.user_id = auth.uid()
    )
  );

create policy "reschedules_insert_own" on reschedules
  for insert with check (
    exists (
      select 1 from bookings
      where bookings.id = reschedules.booking_id
      and bookings.user_id = auth.uid()
    )
  );