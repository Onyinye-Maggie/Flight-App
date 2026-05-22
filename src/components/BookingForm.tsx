'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/flightStore'

function generatePNR() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function BookingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const { selectedFlight, selectedSeat, resetBooking } = useFlightStore()

  const [fullName, setFullName] = useState('')
  const [passportNo, setPassportNo] = useState('')
  const [nationality, setNationality] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!selectedFlight || !selectedSeat) {
    return (
      <div className="text-center py-20 text-gray-500">
        No flight or seat selected.{' '}
        <a href="/search" className="text-blue-600 hover:underline">
          Start over
        </a>
      </div>
    )
  }

  const totalPrice = selectedFlight.base_price + selectedSeat.extra_fee

  async function handleSubmit() {
    setError('')
    if (!fullName || !passportNo || !nationality || !dob) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    const pnrCode = generatePNR()

    const { data, error: rpcError } = await supabase.rpc('reserve_seat', {
      p_seat_id: selectedSeat!.id,
      p_flight_id: selectedFlight!.id,
      p_user_id: userId,
      p_total_price: totalPrice,
      p_pnr_code: pnrCode,
      p_full_name: fullName,
      p_passport_no: passportNo,
      p_nationality: nationality,
      p_dob: dob,
    })

    if (rpcError || !data?.success) {
      setError(rpcError?.message ?? data?.error ?? 'Booking failed. Please try again.')
      setLoading(false)
      return
    }

    resetBooking()
    router.push(`/confirmation?pnr=${pnrCode}`)
  }

  return (
    <div className="space-y-6">
      {/* Booking summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm">
        <p className="font-semibold text-blue-900">
          {selectedFlight.origin} → {selectedFlight.destination}
        </p>
        <p className="text-blue-700 mt-1">
          Flight {selectedFlight.flight_no} · Seat {selectedSeat.seat_number} ·{' '}
          <span className="capitalize">{selectedSeat.class}</span>
        </p>
        <p className="text-blue-800 font-bold mt-2">
          Total: ₦{totalPrice.toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="As on passport"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passport number
          </label>
          <input
            type="text"
            value={passportNo}
            onChange={(e) => setPassportNo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. A12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality
          </label>
          <input
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Nigerian"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Confirming booking...' : 'Confirm booking'}
        </button>
      </div>
    </div>
  )
}