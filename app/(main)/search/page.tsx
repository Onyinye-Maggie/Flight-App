'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/flightStore'

const LOCATIONS = ['Lagos', 'Abuja', 'London', 'Dubai', 'Accra']

export default function SearchPage() {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useFlightStore()

  const [origin, setOrigin] = useState(searchQuery.origin)
  const [destination, setDestination] = useState(searchQuery.destination)
  const [date, setDate] = useState(searchQuery.date)
  const [passengers, setPassengers] = useState(searchQuery.passengers)
  const [error, setError] = useState('')

  function handleSearch() {
  setError('')
  if (!origin || !destination || !date) {
    setError('Please fill in all fields.')
    return
  }
  if (origin === destination) {
    setError('Origin and destination cannot be the same.')
    return
  }
  setSearchQuery({ origin, destination, date, passengers })
  router.push(`/results?origin=${origin}&destination=${destination}&date=${date}`)
}
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find your flight</h1>
        <p className="text-gray-500 mt-1">Search from available routes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select origin</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select destination</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'passenger' : 'passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition"
        >
          Search Flights
        </button>
      </div>
    </div>
  )
}