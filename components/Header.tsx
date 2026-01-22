'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const navLinks = [
    { href: '/#capabilities', label: 'Services' },
    { href: '/#work', label: 'Work' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/book-consultation', label: 'Contact' },
  ]

  return (
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

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book-consultation"
              className="btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start a Project
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
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
        }

        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
          mix-blend-mode: multiply; /* Makes white background transparent */
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

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .hamburger {
          display: block;
          width: 24px;
          height: 2px;
          background-color: var(--color-text-primary);
          position: relative;
          transition: background-color var(--transition-fast);
        }

        .hamburger::before,
        .hamburger::after {
          content: '';
          position: absolute;
          left: 0;
          width: 24px;
          height: 2px;
          background-color: var(--color-text-primary);
          transition: transform var(--transition-fast);
        }

        .hamburger::before {
          top: -7px;
        }

        .hamburger::after {
          bottom: -7px;
        }

        .hamburger.open {
          background-color: transparent;
        }

        .hamburger.open::before {
          transform: translateY(7px) rotate(45deg);
        }

        .hamburger.open::after {
          transform: translateY(-7px) rotate(-45deg);
        }

        .mobile-nav {
          display: none;
          flex-direction: column;
          gap: 16px;
          padding: 24px 0;
          border-top: 1px solid var(--color-border-light);
        }

        .mobile-nav-link {
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-secondary);
          padding: 8px 0;
        }

        @media (max-width: 768px) {
          .nav-links,
          .nav-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-nav {
            display: flex;
          }
          
          /* Override global container padding for header to bring logo closer to edge */
          :global(.header) .container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>
    </header>
  )
}
