import type { Metadata } from 'next'
import PricingPage from '@/components/sections/PricingPage'

export const metadata: Metadata = {
  title: 'Pricing | Taskive Tech — Website Packages & Service Guide',
  description:
    'Explore transparent pricing for landing pages, business websites, e-commerce stores, booking platforms, and custom web applications. Canadian-based studio with packages starting from C$400.',
  openGraph: {
    title: 'Pricing | Taskive Tech',
    description:
      'Transparent website pricing from C$400. Landing pages, e-commerce, booking systems, and custom platforms.',
    type: 'website',
  },
}

export default function Pricing() {
  return <PricingPage />
}
