import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Booking } from '@/types/database'

interface UserStore {
  sessionToken: string | null
  cachedBookings: Booking[]
  setSessionToken: (token: string | null) => void
  setCachedBookings: (bookings: Booking[]) => void
  resetUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      sessionToken: null,
      cachedBookings: [],
      setSessionToken: (token) => set({ sessionToken: token }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      resetUser: () => set({ sessionToken: null, cachedBookings: [] }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        // cachedBookings excluded from persistence intentionally
      }),
    }
  )
)