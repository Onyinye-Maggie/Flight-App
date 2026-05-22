'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/flightStore'
import { Flight, Seat, SeatClass } from '@/types/database'

const CLASS_COLORS: Record<SeatClass, string> = {
  first: 'bg-purple-100 border-purple-300 text-purple-700',
  business: 'bg-blue-100 border-blue-300 text-blue-700',
  economy: 'bg-gray-100 border-gray-300 text-gray-700',
}

const CLASS_SELECTED = 'bg-blue-600 border-blue-700 text-white'
const CLASS_OCCUPIED = 'bg-gray-300 border-gray-400 text-gray-400 cursor-not-allowed opacity-60'

export default function SeatMap({
  flight,
  initialSeats,
}: {
  flight: Flight
  initialSeats: Seat[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const { setSelectedSeat } = useFlightStore()
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          setSeats((prev) =>
            prev.map((s) =>
              s.id === payload.new.id ? (payload.new as Seat) : s
            )
          )
          // Deselect if someone else just took the seat
          if (payload.new.id === selectedSeatId && !payload.new.is_available) {
            setSelectedSeatId(null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [flight.id, selectedSeatId])

  function handleSeatClick(seat: Seat) {
    if (!seat.is_available) return
    // Optimistic selection
    setSelectedSeatId(seat.id)
    setSelectedSeat(seat)
  }

  function handleContinue() {
    if (!selectedSeatId) return
    router.push('/book')
  }

  const selectedSeat = seats.find((s) => s.id === selectedSeatId)

  // Group seats by class then by row
  const firstClass = seats.filter((s) => s.class === 'first')
  const businessClass = seats.filter((s) => s.class === 'business')
  const economyClass = seats.filter((s) => s.class === 'economy')

  function renderSection(sectionSeats: Seat[], label: string, cols: number) {
    const rows: Seat[][] = []
    for (let i = 0; i < sectionSeats.length; i += cols) {
      rows.push(sectionSeats.slice(i, i + cols))
    }

    return (
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {label}
        </p>
        <div className="space-y-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {row.map((seat, colIdx) => {
                const isSelected = seat.id === selectedSeatId
                const isOccupied = !seat.is_available
                const baseClass = isOccupied
                  ? CLASS_OCCUPIED
                  : isSelected
                  ? CLASS_SELECTED
                  : CLASS_COLORS[seat.class]

                // Aisle gap after column 2 (A B _ C D) or column 3 (A B C _ D E F)
                const showAisle =
                  (cols === 4 && colIdx === 1) || (cols === 6 && colIdx === 2)

                return (
                  <div key={seat.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleSeatClick(seat)}
                      disabled={isOccupied}
                      title={
                        isOccupied
                          ? `${seat.class} · Occupied`
                          : `${seat.seat_number} · ${seat.class} · +₦${seat.extra_fee.toLocaleString()}`
                      }
                      className={`w-9 h-9 rounded-md border text-xs font-medium transition ${baseClass}`}
                    >
                      {seat.seat_number}
                    </button>
                    {showAisle && <div className="w-4" />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-blue-600 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-gray-300 inline-block" />
          Occupied
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-purple-100 border border-purple-300 inline-block" />
          First
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-blue-100 border border-blue-300 inline-block" />
          Business
        </span>
      </div>

      {/* Seat grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto max-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-8 bg-gray-200 rounded-t-full mb-6 flex items-center justify-center">
            <span className="text-xs text-gray-500">Front</span>
          </div>

          {renderSection(firstClass, 'First Class', 4)}
          {renderSection(businessClass, 'Business Class', 6)}
          {renderSection(economyClass, 'Economy Class', 6)}
        </div>
      </div>

      {/* Selected seat summary + continue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          {selectedSeat ? (
            <>
              <p className="text-sm font-semibold text-gray-900">
                Seat {selectedSeat.seat_number} ·{' '}
                <span className="capitalize">{selectedSeat.class}</span>
              </p>
              <p className="text-xs text-gray-500">
                Extra fee: ₦{selectedSeat.extra_fee.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No seat selected</p>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedSeatId}
          className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}