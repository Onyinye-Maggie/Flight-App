import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingForm from '@/components/BookingForm'

export default async function BookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Passenger details</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in your details to complete the booking
        </p>
      </div>
      <BookingForm userId={user.id} />
    </div>
  )
}