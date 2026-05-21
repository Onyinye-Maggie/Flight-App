-- Insert 8 flights across 4 routes
insert into flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price) values
('FL001', 'Lagos', 'Abuja', '2026-06-01 06:00:00+00', '2026-06-01 07:05:00+00', 'Boeing 737', 45000),
('FL002', 'Abuja', 'Lagos', '2026-06-01 09:00:00+00', '2026-06-01 10:05:00+00', 'Boeing 737', 45000),
('FL003', 'Lagos', 'London', '2026-06-02 22:00:00+00', '2026-06-03 06:00:00+00', 'Boeing 777', 850000),
('FL004', 'London', 'Lagos', '2026-06-03 10:00:00+00', '2026-06-03 20:00:00+00', 'Boeing 777', 850000),
('FL005', 'Lagos', 'Dubai', '2026-06-04 01:00:00+00', '2026-06-04 09:00:00+00', 'Airbus A380', 620000),
('FL006', 'Dubai', 'Lagos', '2026-06-05 11:00:00+00', '2026-06-05 17:00:00+00', 'Airbus A380', 620000),
('FL007', 'Lagos', 'Accra', '2026-06-06 08:00:00+00', '2026-06-06 09:10:00+00', 'Airbus A220', 120000),
('FL008', 'Accra', 'Lagos', '2026-06-06 11:00:00+00', '2026-06-06 12:10:00+00', 'Airbus A220', 120000);


-- Seed seats for each flight
do $$
declare
  f record;
  row_num int;
  col text;
begin
  for f in select id from flights loop

    -- First class: rows 1-2, seats A-D
    for row_num in 1..2 loop
      foreach col in array array['A','B','C','D'] loop
        insert into seats (flight_id, seat_number, class, extra_fee)
        values (f.id, row_num || col, 'first', 150000);
      end loop;
    end loop;

    -- Business class: rows 3-7, seats A-F
    for row_num in 3..7 loop
      foreach col in array array['A','B','C','D','E','F'] loop
        insert into seats (flight_id, seat_number, class, extra_fee)
        values (f.id, row_num || col, 'business', 80000);
      end loop;
    end loop;

    -- Economy class: rows 8-30, seats A-F
    for row_num in 8..30 loop
      foreach col in array array['A','B','C','D','E','F'] loop
        insert into seats (flight_id, seat_number, class, extra_fee)
        values (f.id, row_num || col, 'economy', 0);
      end loop;
    end loop;

  end loop;
end;
$$;