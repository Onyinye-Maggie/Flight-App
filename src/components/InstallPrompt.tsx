'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 flex items-center justify-between shadow-lg z-50 sm:max-w-sm sm:left-4 sm:bottom-4 sm:rounded-2xl sm:border">
      <div>
        <p className="text-sm font-semibold text-gray-900">Install FlightApp</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Add to your home screen for quick access
        </p>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => setShowBanner(false)}
          className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          Install
        </button>
      </div>
    </div>
  )
}