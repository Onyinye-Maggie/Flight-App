-- SEAT LOCK RPC: prevents double-booking
create or replace function reserve_seat(
  p_seat_id uuid,
  p_flight_id uuid,
  p_user_id uuid,
  p_total_price numeric,
  p_pnr_code text,
  p_full_name text,
  p_passport_no text,
  p_nationality text,
  p_dob date
)
returns json
language plpgsql
security definer
as $$
declare
  v_booking_id uuid;
  v_seat_available boolean;
begin
  -- Lock the seat row to prevent race conditions
  select is_available into v_seat_available
  from seats
  where id = p_seat_id and flight_id = p_flight_id
  for update;

  if not v_seat_available then
    return json_build_object('success', false, 'error', 'Seat is no longer available');
  end if;

  -- Mark seat as unavailable
  update seats set is_available = false where id = p_seat_id;

  -- Create booking
  insert into bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (p_user_id, p_flight_id, p_seat_id, p_total_price, p_pnr_code)
  returning id into v_booking_id;

  -- Create passenger record
  insert into passengers (booking_id, full_name, passport_no, nationality, dob)
  values (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  return json_build_object('success', true, 'booking_id', v_booking_id);
end;
$$;


-- CANCELLATION TRIGGER: blocks cancellations within 2 hours of departure
create or replace function check_cancellation_window()
returns trigger
language plpgsql
as $$
declare
  v_departs_at timestamptz;
begin
  if NEW.status = 'cancelled' and OLD.status != 'cancelled' then
    select departs_at into v_departs_at
    from flights where id = OLD.flight_id;

    if v_departs_at - now() < interval '2 hours' then
      raise exception 'Cancellation not allowed within 2 hours of departure';
    end if;
  end if;
  return NEW;
end;
$$;

create trigger enforce_cancellation_window
  before update on bookings
  for each row
  execute function check_cancellation_window();


-- CANCEL BOOKING RPC: cancels booking and frees seat atomically
create or replace function cancel_booking(p_booking_id uuid, p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_seat_id uuid;
begin
  select seat_id into v_seat_id
  from bookings
  where id = p_booking_id and user_id = p_user_id;

  if not found then
    return json_build_object('success', false, 'error', 'Booking not found');
  end if;

  -- This will trigger the cancellation window check
  update bookings set status = 'cancelled' where id = p_booking_id;

  -- Free the seat
  update seats set is_available = true where id = v_seat_id;

  return json_build_object('success', true);
end;
$$;