'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const navLinks = [
    { href: '/#capabilities', label: 'Services' },
    { href: '/#work', label: 'Work' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/book-consultation', label: 'Contact' },
  ]

  return (
    <>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link href="/" className="logo-link">
              <Image
                src="/logoooo.png"
                alt="Taskive Tech"
                width={140}
                height={40}
                priority
                className="logo-image"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="nav-actions">
              <Link href="/book-consultation" className="btn btn-primary">
                Start a Project
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </button>
          </nav>
        </div>
      </header>

      {/* Full-screen Mobile Menu — outside header to avoid container constraints */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-link"
              style={{ transitionDelay: mobileMenuOpen ? `${i * 0.05 + 0.15}s` : '0s' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div
            className="mobile-cta-wrap"
            style={{ transitionDelay: mobileMenuOpen ? `${navLinks.length * 0.05 + 0.15}s` : '0s' }}
          >
            <Link
              href="/book-consultation"
              className="btn btn-primary mobile-cta"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start a Project
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ─── HEADER BAR ─────────────────────────── */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background-color: rgba(250, 250, 250, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border-light);
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .logo-link {
          display: flex;
          align-items: center;
          position: relative;
          z-index: 10000;
        }

        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .nav-links {
          display: flex;
          gap: 40px;
        }

        .nav-link {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--color-text-primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* ─── HAMBURGER BUTTON ───────────────────── */
        .mobile-menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          border-radius: 12px;
          position: relative;
          z-index: 10000;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          -webkit-tap-highlight-color: transparent;
        }

        .bar {
          display: block;
          height: 2px;
          background-color: var(--color-text-primary);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        .bar-1 { width: 24px; }
        .bar-2 { width: 18px; margin-left: auto; margin-right: auto; }
        .bar-3 { width: 24px; }

        .mobile-menu-btn.active .bar-1 {
          transform: translateY(8px) rotate(45deg);
          width: 24px;
        }
        .mobile-menu-btn.active .bar-2 {
          opacity: 0;
          transform: scaleX(0);
        }
        .mobile-menu-btn.active .bar-3 {
          transform: translateY(-8px) rotate(-45deg);
          width: 24px;
        }

        /* ─── FULL-SCREEN OVERLAY ────────────────── */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: #ffffff;
          z-index: 9998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          padding: 0 32px;
        }

        .mobile-link {
          font-size: 36px;
          font-weight: 600;
          color: var(--color-text-primary);
          text-decoration: none;
          letter-spacing: -0.02em;
          padding: 12px 0;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease, color 0.2s ease;
        }

        .mobile-menu-overlay.open .mobile-link {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-link:hover {
          color: var(--color-accent);
        }

        .mobile-cta-wrap {
          margin-top: 32px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .mobile-menu-overlay.open .mobile-cta-wrap {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-cta {
          padding: 16px 48px;
          font-size: 17px;
          border-radius: 12px;
        }

        /* ─── RESPONSIVE ─────────────────────────── */
        @media (max-width: 768px) {
          .nav-links,
          .nav-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .mobile-menu-overlay {
            display: block;
          }

          :global(.header) .container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>
    </>
  )
}
