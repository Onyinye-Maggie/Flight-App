'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/flightStore'
const resetBooking = useFlightStore((state) => state.resetBooking)
const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function BookingsList({ bookings }: { bookings: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'cancel' | 'reschedule'
    bookingId: string
    flightId: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel(bookingId: string) {
    setLoading(true)
    resetBooking()
    setError('')

    const { data: userData } = await supabase.auth.getUser()

    const { data, error: rpcError } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId,
      p_user_id: userData.user?.id,
    })

    if (rpcError || !data?.success) {
      setError(rpcError?.message ?? data?.error ?? 'Cancellation failed.')
      setLoading(false)
      setConfirmDialog(null)
      return
    }

    setConfirmDialog(null)
    setLoading(false)
    router.refresh()
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {bookings.map((booking) => {
        const flight = booking.flights
        const seat = booking.seats
        const isCancelled = booking.status === 'cancelled'

        return (
          <div
            key={booking.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900">
                  {flight.origin} &rarr; {flight.destination}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {flight.flight_no} · PNR:{' '}
                  <span className="font-mono font-semibold text-blue-600">
                    {booking.pnr_code}
                  </span>
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  STATUS_STYLES[booking.status]
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-gray-500">Departure</p>
                <p className="font-medium">{formatDateTime(flight.departs_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Seat</p>
                <p className="font-medium capitalize">
                  {seat.seat_number} · {seat.class}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total paid</p>
                <p className="font-medium">
                  &#8358;{booking.total_price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Booked on</p>
                <p className="font-medium">{formatDateTime(booking.booked_at)}</p>
              </div>
            </div>

            {!isCancelled && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      type: 'reschedule',
                      bookingId: booking.id,
                      flightId: flight.id,
                    })
                  }
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  Reschedule
                </button>
                <button
                  onClick={() =>
                    setConfirmDialog({
                      type: 'cancel',
                      bookingId: booking.id,
                      flightId: flight.id,
                    })
                  }
                  className="text-sm border border-red-200 text-red-500 px-4 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Confirmation dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            {confirmDialog.type === 'cancel' ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Cancel booking?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. Cancellations within 2 hours of
                  departure are not allowed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Keep booking
                  </button>
                  <button
                    onClick={() => handleCancel(confirmDialog.bookingId)}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Cancelling...' : 'Yes, cancel'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Reschedule booking
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  To reschedule, search for a new flight on the same route and
                  select it. Your current booking will be updated.
                </p>
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}