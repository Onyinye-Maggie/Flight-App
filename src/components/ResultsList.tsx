'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/flightStore'
import { Flight } from '@/types/database'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDuration(departs: string, arrives: string) {
  const diff = new Date(arrives).getTime() - new Date(departs).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ResultsList({ flights }: { flights: Flight[] }) {
  const router = useRouter()
  const { setSelectedFlight, setCurrentStep } = useFlightStore()

  function handleSelect(flight: Flight) {
    setSelectedFlight(flight)
    setCurrentStep(2)
    router.push(`/seats?flightId=${flight.id}`)
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatTime(flight.departs_at)}
                </p>
                <p className="text-xs text-gray-500">{flight.origin}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  {getDuration(flight.departs_at, flight.arrives_at)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-12 h-px bg-gray-300" />
                  <span className="text-gray-400 text-xs">✈</span>
                  <div className="w-12 h-px bg-gray-300" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{flight.aircraft_type}</p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatTime(flight.arrives_at)}
                </p>
                <p className="text-xs text-gray-500">{flight.destination}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                {formatPrice(flight.base_price)}
              </p>
              <p className="text-xs text-gray-400 mb-3">per person</p>
              <button
                onClick={() => handleSelect(flight)}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Select
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Economy from {formatPrice(flight.base_price)}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              Business from {formatPrice(flight.base_price + 80000)}
            </span>
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
              First from {formatPrice(flight.base_price + 150000)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}