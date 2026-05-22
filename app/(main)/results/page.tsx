import { createClient } from '@/lib/supabase/server'
import ResultsList from '@/components/ResultsList'

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string; destination?: string; date?: string }>
}) {
  const { origin, destination, date } = await searchParams
  const supabase = await createClient()

  const searchDate = date ? new Date(date) : new Date()
  const startOfDay = new Date(searchDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(searchDate)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin ?? '')
    .eq('destination', destination ?? '')
    .gte('departs_at', startOfDay.toISOString())
    .lte('departs_at', endOfDay.toISOString())
    .eq('status', 'scheduled')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {origin} → {destination}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {date} · {flights?.length ?? 0} flight{flights?.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
          Failed to load flights. Please try again.
        </div>
      )}

      {!error && flights?.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No flights found for this route and date.</p>
          <a href="/search" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Back to search
          </a>
        </div>
      )}

      {flights && flights.length > 0 && <ResultsList flights={flights} />}
    </div>
  )
}