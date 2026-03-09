'use client'

import { useEffect } from 'react'

interface CalendlyWidgetProps {
  url?: string
  prefill?: {
    name?: string
    email?: string
  }
  onEventScheduled?: () => void
}

export default function CalendlyWidget({ url, prefill, onEventScheduled }: CalendlyWidgetProps) {
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL

  useEffect(() => {
    // 1. Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    // 2. Listen for Calendly messages
    const handleCalendlyMessage = (e: MessageEvent) => {
      // Check if it's a Calendly event
      if (e.data.event && e.data.event === 'calendly.event_scheduled') {
        console.log('Calendly event scheduled detected')
        if (onEventScheduled) {
          onEventScheduled()
        }
      }
    }

    window.addEventListener('message', handleCalendlyMessage)

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [onEventScheduled])

  if (!calendlyUrl) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
        Calendly URL not configured.
      </div>
    )
  }

  // Construct URL with prefill parameters
  const baseUrl = new URL(calendlyUrl)
  baseUrl.searchParams.set('hide_landing_page_details', '1')
  baseUrl.searchParams.set('hide_gdpr_banner', '1')
  
  if (prefill?.name) baseUrl.searchParams.set('name', prefill.name)
  if (prefill?.email) baseUrl.searchParams.set('email', prefill.email)

  return (
    <>
      <div 
        className="calendly-inline-widget" 
        data-url={baseUrl.toString()}
        style={{ minWidth: '320px', height: '630px' }}
      ></div>
    </>
  )
}
