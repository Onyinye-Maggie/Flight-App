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
  passengerForm: {
    fullName: string
    nationality: string
    dob: string
    // passport number is intentionally NOT stored here
  }
  setSearchQuery: (query: SearchQuery) => void
  setSelectedFlight: (flight: Flight) => void
  setSelectedSeat: (seat: Seat) => void
  setCurrentStep: (step: number) => void
  setPassengerForm: (form: FlightStore['passengerForm']) => void
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
      passengerForm: {
        fullName: '',
        nationality: '',
        dob: '',
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPassengerForm: (form) => set({ passengerForm: form }),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          currentStep: 1,
          passengerForm: { fullName: '', nationality: '', dob: '' },
        }),
    }),
    {
      name: 'flight-store',
      // partialize controls what gets saved to localStorage
      // passport numbers are never stored here — they stay in component state only
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        currentStep: state.currentStep,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        // passengerForm excluded entirely from localStorage
      }),
    }
  )
)