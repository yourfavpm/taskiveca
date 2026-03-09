'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CompanySettings } from '@/lib/types'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchSettings = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('company_settings').select('*').single()
      
      if (!mounted) return
      
      if (error) {
        // Silently ignore — table may not exist or have no rows yet
        return
      }
      if (data) setCompanySettings(data)
    }

    if (!pathname?.startsWith('/admin')) {
      fetchSettings()
    }

    return () => {
      mounted = false
    }
  }, [pathname])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const footerLinks = {
    services: [
      { href: '/#capabilities', label: 'Landing Pages' },
      { href: '/#capabilities', label: 'E-commerce' },
      { href: '/#capabilities', label: 'Web Applications' },
      { href: '/#capabilities', label: 'SaaS Development' },
    ],
    company: [
      { href: '/#work', label: 'Our Work' },
      { href: '/#how-we-work', label: 'Process' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/book-consultation', label: 'Contact' },
    ],
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Taskive Tech
            </Link>
            <p className="footer-tagline">
              A studio-led product and engineering team building websites, platforms, and scalable systems.
            </p>

            {companySettings && (
              <div className="footer-contact-info">
                {companySettings.address && (
                  <p className="contact-item address">{companySettings.address}</p>
                )}
                {companySettings.contact_email && (
                  <p className="contact-item">
                    <a href={`mailto:${companySettings.contact_email}`}>{companySettings.contact_email}</a>
                  </p>
                )}
                {companySettings.contact_phone && (
                  <p className="contact-item">{companySettings.contact_phone}</p>
                )}

                <div className="social-links">
                  {companySettings.social_tiktok && (
                    <a href={companySettings.social_tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
                  )}
                  {companySettings.social_instagram && (
                    <a href={companySettings.social_instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="footer-links-group">
            <div className="footer-links">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-list">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Taskive Tech. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--color-text-primary);
          color: var(--color-background);
          padding: 80px 0 40px;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 64px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
          max-width: 360px;
        }

        .footer-logo {
          font-size: 22px;
          font-weight: 600;
          color: var(--color-background-white);
          letter-spacing: -0.02em;
        }

        .footer-logo:hover {
          color: var(--color-background-white);
        }

        .footer-tagline {
          margin-top: 16px;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer-contact-info {
          margin-top: 32px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        
        .contact-item {
          margin-bottom: 8px;
        }
        
        .contact-item a {
          color: inherit;
          text-decoration: none;
        }
        
        .contact-item a:hover {
          color: #fff;
        }
        
        .address {
          white-space: pre-wrap;
          margin-bottom: 16px;
        }
        
        .social-links {
          margin-top: 24px;
          display: flex;
          gap: 16px;
        }
        
        .social-links a {
          color: #fff;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 2px;
        }

        .footer-links-group {
          display: flex;
          gap: 64px;
        }

        .footer-heading {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 20px;
        }

        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-list li {
          margin-bottom: 12px;
        }

        .footer-link {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          transition: color var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--color-background-white);
        }

        .footer-bottom {
          padding-top: 32px;
        }

        .copyright {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .footer {
            padding: 64px 0 32px;
          }

          .footer-top {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .footer-links-group {
            gap: 48px;
          }
        }
      `}</style>
    </footer>
  )
}
