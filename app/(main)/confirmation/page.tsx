import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ pnr?: string }>
}) {
  const { pnr } = await searchParams
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('pnr_code', pnr ?? '')
    .single()

  if (!booking) {
    return (
      <div className="text-center py-20 text-gray-500">
        Booking not found.{' '}
        <Link href="/search" className="text-blue-600 hover:underline">
          Go back
        </Link>
      </div>
    )
  }

  const flight = booking.flights as any
  const seat = booking.seats as any
  const passenger = (booking.passengers as any[])?.[0]

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-2xl font-bold text-green-800">Booking confirmed!</h1>
        <p className="text-green-600 text-sm mt-1">
          Your booking reference is below
        </p>
        <div className="mt-4 bg-white rounded-xl px-6 py-3 inline-block border border-green-200">
          <p className="text-xs text-gray-500 mb-1">PNR Code</p>
          <p className="text-3xl font-bold tracking-widest text-blue-600">
            {booking.pnr_code}
          </p>
        </div>
      </div>

      {/* Flight details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Flight details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Flight</p>
            <p className="font-medium">{flight.flight_no}</p>
          </div>
          <div>
            <p className="text-gray-500">Route</p>
            <p className="font-medium">
              {flight.origin} → {flight.destination}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Departure</p>
            <p className="font-medium">{formatDateTime(flight.departs_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Arrival</p>
            <p className="font-medium">{formatDateTime(flight.arrives_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Seat</p>
            <p className="font-medium capitalize">
              {seat.seat_number} · {seat.class}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total paid</p>
            <p className="font-medium text-blue-600">
              ₦{booking.total_price.toLocaleString()}
            </p>
          </div>
        </div>

        {passenger && (
          <>
            <hr className="border-gray-100" />
            <h2 className="font-semibold text-gray-900">Passenger</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{passenger.full_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Nationality</p>
                <p className="font-medium">{passenger.nationality}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          href="/bookings"
          className="flex-1 bg-blue-600 text-white text-sm text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          View my bookings
        </Link>
        <Link
          href="/search"
          className="flex-1 border border-gray-300 text-gray-700 text-sm text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Book another flight
        </Link>
      </div>
    </div>
  )
}