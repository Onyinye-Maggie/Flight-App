import { createClient } from '@/lib/supabase/server'
import SeatMap from '@/components/SeatMap'

export default async function SeatsPage({
  searchParams,
}: {
  searchParams: Promise<{ flightId?: string }>
}) {
  const { flightId } = await searchParams
  const supabase = await createClient()

  const { data: flight } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId ?? '')
    .single()

  const { data: seats } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', flightId ?? '')
    .order('seat_number')

  if (!flight || !seats) {
    return (
      <div className="text-center py-20 text-gray-500">
        Flight not found.{' '}
        <a href="/search" className="text-blue-600 hover:underline">
          Go back
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Select your seat</h1>
        <p className="text-gray-500 text-sm mt-1">
          {flight.origin} → {flight.destination} · {flight.flight_no}
        </p>
      </div>

      <SeatMap flight={flight} initialSeats={seats} />
    </div>
  )
}