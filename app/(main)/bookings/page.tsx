import { createClient } from '@/lib/supabase/server'
import BookingsList from '@/components/BookingsList'
import Link from 'next/link'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        You must be logged in to view bookings.
      </div>
    )
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load bookings. Please refresh.
      </div>
    )
  }

  const hasBookings = bookings && bookings.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          {bookings?.length ?? 0} booking{bookings?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {hasBookings ? (
        <BookingsList bookings={bookings} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">You have no bookings yet.</p>
          <Link
            href="/search"
            className="text-blue-600 text-sm mt-2 inline-block hover:underline"
          >
            Search for flights
          </Link>
        </div>
      )}
    </div>
  )
}