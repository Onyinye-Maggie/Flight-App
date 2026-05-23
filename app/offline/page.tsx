import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">✈️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You are offline
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          No internet connection detected. Your previously viewed bookings
          may still be available below.
        </p>
        <Link
          href="/bookings"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          View my bookings
        </Link>
      </div>
    </div>
  )
}