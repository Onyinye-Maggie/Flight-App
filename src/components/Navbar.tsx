'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFlightStore } from '@/store/flightStore'
import { useUserStore } from '@/store/userStore'

export default function Navbar({ email }: { email: string }) {
  const router = useRouter()
  const supabase = createClient()
  const resetBooking = useFlightStore((state) => state.resetBooking)
  const resetUser = useUserStore((state) => state.resetUser)

  async function handleLogout() {
    await supabase.auth.signOut()
    resetBooking()
    resetUser()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/search" className="text-blue-600 font-bold text-lg">
          ✈ FlightApp
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Search
          </Link>
          <Link
            href="/bookings"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            My Bookings
          </Link>
          <span className="text-sm text-gray-400 hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}