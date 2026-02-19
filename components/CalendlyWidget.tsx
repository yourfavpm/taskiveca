'use client'

import { useEffect } from 'react'

interface CalendlyWidgetProps {
  url?: string
  prefill?: {
    name?: string
    email?: string
  }
}

export default function CalendlyWidget({ url, prefill }: CalendlyWidgetProps) {
  const calendlyUrl = url || process.env.NEXT_PUBLIC_CALENDLY_URL

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
