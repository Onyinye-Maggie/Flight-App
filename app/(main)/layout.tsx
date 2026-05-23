import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InstallPrompt from '@/components/InstallPrompt'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email ?? ''} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <InstallPrompt />
    </div>
  )
}