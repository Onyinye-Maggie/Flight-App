import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Flight, Seat } from '@/types/database'

interface SearchQuery {
  origin: string
  destination: string
  date: string
  passengers: number
}

interface FlightStore {
  searchQuery: SearchQuery
  selectedFlight: Flight | null
  selectedSeat: Seat | null
  currentStep: number
  setSearchQuery: (query: SearchQuery) => void
  setSelectedFlight: (flight: Flight) => void
  setSelectedSeat: (seat: Seat) => void
  setCurrentStep: (step: number) => void
  resetBooking: () => void
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: {
        origin: '',
        destination: '',
        date: '',
        passengers: 1,
      },
      selectedFlight: null,
      selectedSeat: null,
      currentStep: 1,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetBooking: () =>
        set({ selectedFlight: null, selectedSeat: null, currentStep: 1 }),
    }),
    {
      name: 'flight-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        currentStep: state.currentStep,
        selectedFlight: state.selectedFlight,
        // selectedSeat is included but passport numbers are never stored here
      }),
    }
  )
)