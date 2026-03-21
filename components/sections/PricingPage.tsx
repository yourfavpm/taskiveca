'use client'

import Link from 'next/link'

const packages = [
  {
    icon: '🔹',
    title: 'Landing Page / Portfolio Website',
    bestFor: 'Personal brands, startups, consultants',
    priceRange: 'C$400 – C$800',
    features: [
      '1–3 pages (Home, About, Contact)',
      'Modern, high-converting UI design',
      'Fully mobile responsive',
      'Contact form + lead capture',
      'Basic SEO setup',
      'Fast loading optimization',
      'Social media integration',
    ],
    perfectFor: ['Coaches', 'Freelancers', 'Creators', 'Early-stage startups'],
  },
  {
    icon: '🏢',
    title: 'Business / Corporate Website',
    bestFor: 'Small to mid-sized businesses',
    priceRange: 'C$800 – C$1,500',
    features: [
      '4–8 pages',
      'Conversion-focused design',
      'Service pages with structured layout',
      'Lead generation forms',
      'Blog setup (optional)',
      'Google Maps integration',
      'Basic on-page SEO',
      'Mobile + tablet optimization',
    ],
    perfectFor: ['Service businesses', 'Agencies', 'Cleaning companies', 'Logistics & moving companies'],
  },
  {
    icon: '🛒',
    title: 'E-commerce Website',
    bestFor: 'Brands selling products online',
    priceRange: 'C$1,200 – C$2,500',
    features: [
      'Full online store setup',
      'Product upload (20–50 products)',
      'Payment integration (Stripe, PayPal)',
      'Cart & checkout system',
      'Order management dashboard',
      'Inventory system',
      'Discount/coupon system',
      'Email notifications',
    ],
    perfectFor: ['Clothing brands', 'Beauty brands', 'Niche product stores'],
  },
  {
    icon: '📅',
    title: 'Booking / Service Website',
    bestFor: 'Appointment-based businesses',
    priceRange: 'C$1,000 – C$2,000',
    features: [
      'Booking calendar system',
      'Time slot selection',
      'Automated confirmations',
      'Payment integration (optional)',
      'Admin dashboard',
      'Customer management',
    ],
    perfectFor: ['Salons', 'Clinics', 'Consultants', 'Home service providers'],
  },
  {
    icon: '🏡',
    title: 'Real Estate / Property Website',
    bestFor: 'Realtors & property companies',
    priceRange: 'C$1,200 – C$2,500',
    features: [
      'Property listings',
      'Advanced search & filters',
      'Property detail pages',
      'Image galleries',
      'Inquiry forms',
      'Google Maps integration',
    ],
    perfectFor: ['Realtors', 'Property managers', 'Real estate agencies'],
  },
  {
    icon: '⚙️',
    title: 'Custom Web Platform',
    bestFor: 'Startups, SaaS, advanced solutions',
    priceRange: 'C$2,500 – C$10,000+',
    features: [
      'Fully custom UI/UX design',
      'User authentication systems',
      'Admin & user dashboards',
      'API integrations',
      'Payment systems',
      'Scalable architecture',
    ],
    perfectFor: ['Marketplaces', 'EdTech platforms', 'Talent platforms', 'Internal business tools'],
    featured: true,
  },
]

const addOnCategories = [
  {
    icon: '🎯',
    title: 'Design & Experience',
    items: [
      { name: 'Premium UI/UX upgrade', price: 'C$150 – C$500' },
      { name: 'Advanced animations', price: 'C$200 – C$600' },
      { name: 'Custom graphics/illustrations', price: 'C$100 – C$400' },
    ],
  },
  {
    icon: '📈',
    title: 'Growth & Marketing',
    items: [
      { name: 'Advanced SEO optimization', price: 'C$200 – C$800' },
      { name: 'Google Analytics + tracking', price: 'C$50 – C$150' },
      { name: 'Email marketing integration', price: 'C$150 – C$500' },
      { name: 'Funnel/landing page optimization', price: 'C$200 – C$700' },
    ],
  },
  {
    icon: '🛒',
    title: 'E-commerce Add-ons',
    items: [
      { name: 'Additional products upload', price: 'C$50 per 10 products' },
      { name: 'Subscription system', price: 'C$300 – C$800' },
      { name: 'Abandoned cart recovery', price: 'C$200 – C$500' },
    ],
  },
  {
    icon: '⚙️',
    title: 'Technical Add-ons',
    items: [
      { name: 'User dashboard system', price: 'C$500 – C$2,000' },
      { name: 'API integrations', price: 'C$200 – C$1,000' },
      { name: 'Multi-language support', price: 'C$300 – C$800' },
      { name: 'Performance optimization', price: 'C$200 – C$600' },
    ],
  },
  {
    icon: '🔐',
    title: 'Security & Maintenance',
    items: [
      { name: 'Monthly maintenance', price: 'C$100 – C$400/month' },
      { name: 'Backup systems', price: 'C$100' },
      { name: 'Security hardening', price: 'C$150 – C$400' },
    ],
  },
  {
    icon: '💬',
    title: 'Automation & Integrations',
    items: [
      { name: 'WhatsApp / chat automation', price: 'C$150 – C$500' },
      { name: 'Live chat system', price: 'C$100 – C$300' },
      { name: 'CRM integration', price: 'C$300 – C$1,000' },
    ],
  },
]

const projectTerms = [
  '50% upfront, 50% on completion',
  'Timeline: 2–6 weeks depending on scope',
  '2–3 revision rounds included',
  'Additional revisions billed hourly',
  'Hosting & domain billed separately',
  'Clear scope document before start',
]

export default function PricingPage() {
  return (
    <div className="pricing-page">
      {/* ─── HERO ────────────────────────────────── */}
      <section className="pricing-hero">
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">
                Website Pricing &<br />Service Guide
              </h1>
              <p className="hero-subtitle">
                From simple landing pages to full-scale platforms — find the right package for your business. 
                Every project includes modern design, mobile optimization, and dedicated support.
              </p>
              <div className="hero-actions">
                <Link href="/book-consultation" className="btn btn-primary">
                  Get a Custom Quote
                </Link>
                <a href="#packages" className="btn btn-secondary">
                  View Packages ↓
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              {/* Floating coin */}
              <svg className="money-item coin-1" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" fill="#FCD34D" stroke="#F59E0B" strokeWidth="4"/>
                <circle cx="40" cy="40" r="28" stroke="#F59E0B" strokeWidth="2" fill="none"/>
                <text x="40" y="48" textAnchor="middle" fontSize="28" fontWeight="700" fill="#92400E">$</text>
              </svg>

              {/* Dollar bill */}
              <svg className="money-item bill-1" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="136" height="66" rx="6" fill="#86EFAC" stroke="#22C55E" strokeWidth="3"/>
                <rect x="14" y="14" width="112" height="42" rx="3" stroke="#22C55E" strokeWidth="1.5" fill="none"/>
                <circle cx="70" cy="35" r="16" stroke="#16A34A" strokeWidth="1.5" fill="rgba(22,163,74,0.1)"/>
                <text x="70" y="42" textAnchor="middle" fontSize="22" fontWeight="700" fill="#15803D">$</text>
              </svg>

              {/* Small coin */}
              <svg className="money-item coin-2" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="26" fill="#FDE68A" stroke="#FBBF24" strokeWidth="3"/>
                <text x="28" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="#92400E">¢</text>
              </svg>

              {/* Credit card */}
              <svg className="money-item card-1" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="116" height="76" rx="8" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="3"/>
                <rect x="2" y="18" width="116" height="14" fill="#3B82F6"/>
                <rect x="14" y="48" width="36" height="8" rx="2" fill="#93C5FD"/>
                <rect x="14" y="60" width="24" height="6" rx="2" fill="#93C5FD"/>
                <circle cx="96" cy="58" r="8" fill="#60A5FA" opacity="0.6"/>
                <circle cx="86" cy="58" r="8" fill="#3B82F6" opacity="0.6"/>
              </svg>

              {/* Another bill */}
              <svg className="money-item bill-2" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="96" height="46" rx="5" fill="#A7F3D0" stroke="#34D399" strokeWidth="2.5"/>
                <circle cx="50" cy="25" r="12" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.1)"/>
                <text x="50" y="31" textAnchor="middle" fontSize="16" fontWeight="700" fill="#047857">$</text>
              </svg>

              {/* Sparkle accent */}
              <svg className="money-item sparkle" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4 L23 16 L36 20 L23 24 L20 36 L17 24 L4 20 L17 16 Z" fill="#FBBF24" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PACKAGES ────────────────────────────── */}
      <section id="packages" className="packages-section section">
        <div className="container">
          <div className="section-header">
            <h2>Our Website Packages</h2>
            <p className="section-subtitle">
              Choose the package that matches your goals. Every build is tailored to your brand.
            </p>
            <p className="scope-note">
              <strong>Note:</strong> Final pricing is determined by project scope, complexity, and specific requirements — all of which we define together during a free discovery call.
            </p>
          </div>

          <div className="packages-grid">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`package-card card ${pkg.featured ? 'featured' : ''}`}
              >
                {pkg.featured && <div className="featured-badge">Most Popular</div>}
                <div className="package-header">
                  <span className="package-icon">{pkg.icon}</span>
                  <h3 className="package-title">{pkg.title}</h3>
                  <p className="package-best-for">{pkg.bestFor}</p>
                </div>

                <div className="package-price">
                  <span className="price-amount">{pkg.priceRange}</span>
                </div>

                <ul className="package-features">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="package-audience">
                  <span className="audience-label">Perfect for:</span>
                  <div className="audience-tags">
                    {pkg.perfectFor.map((audience, i) => (
                      <span key={i} className="audience-tag">{audience}</span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/book-consultation"
                  className={`btn ${pkg.featured ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ADD-ONS ─────────────────────────────── */}
      <section className="addons-section section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Add-Ons & Upgrades</h2>
            <p className="section-subtitle">
              Enhance your website with powerful extras — only pay for what you need.
            </p>
          </div>

          <div className="addons-grid">
            {addOnCategories.map((category, index) => (
              <div key={index} className="addon-card card">
                <div className="addon-header">
                  <span className="addon-icon">{category.icon}</span>
                  <h3 className="addon-title">{category.title}</h3>
                </div>
                <ul className="addon-items">
                  {category.items.map((item, i) => (
                    <li key={i} className="addon-item">
                      <span className="addon-name">{item.name}</span>
                      <span className="addon-price">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECT TERMS ───────────────────────── */}
      <section className="terms-section section">
        <div className="container">
          <div className="terms-card">
            <div className="terms-header">
              <span className="terms-icon">🧾</span>
              <h2 className="terms-title">Project Terms</h2>
              <p className="terms-subtitle">Important details before we begin working together.</p>
            </div>
            <div className="terms-grid">
              {projectTerms.map((term, index) => (
                <div key={index} className="term-item">
                  <span className="term-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="term-text">{term}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────── */}
      <section className="cta-section section bg-white">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to bring your project to life?
            </h2>
            <p className="cta-subtitle">
              Book a free consultation and get a custom quote tailored to your needs.
            </p>
            <Link href="/book-consultation" className="btn btn-primary">
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ─── HERO ───────────────────────────────── */
        .pricing-hero {
          padding: 160px 0 100px;
          background-color: var(--color-background-white);
          position: relative;
          overflow: hidden;
        }

        .pricing-hero::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -200px;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 64px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
          margin-bottom: 24px;
          animation: fadeUp 0.6s ease-out 0.1s both;
        }

        .hero-subtitle {
          font-size: 19px;
          line-height: 1.7;
          color: var(--color-text-secondary);
          max-width: 520px;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease-out 0.2s both;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          animation: fadeUp 0.6s ease-out 0.3s both;
        }

        /* ─── HERO VISUAL (Money Illustrations) ─── */
        .hero-visual {
          position: relative;
          width: 100%;
          height: 380px;
        }

        .money-item {
          position: absolute;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.08));
        }

        .coin-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 15%;
          animation: floatCoin 4s ease-in-out infinite, fadeUp 0.8s ease-out 0.2s both;
        }

        .bill-1 {
          width: 160px;
          top: 5%;
          right: 5%;
          animation: floatBill 5s ease-in-out infinite, fadeUp 0.8s ease-out 0.4s both;
          transform-origin: center;
        }

        .coin-2 {
          width: 50px;
          height: 50px;
          bottom: 20%;
          left: 5%;
          animation: floatCoinSmall 3.5s ease-in-out infinite 0.5s, fadeUp 0.8s ease-out 0.5s both;
        }

        .card-1 {
          width: 140px;
          top: 40%;
          left: 30%;
          animation: floatCard 6s ease-in-out infinite, fadeUp 0.8s ease-out 0.3s both;
        }

        .bill-2 {
          width: 110px;
          bottom: 10%;
          right: 15%;
          animation: floatBill2 4.5s ease-in-out infinite 1s, fadeUp 0.8s ease-out 0.6s both;
        }

        .sparkle {
          width: 32px;
          height: 32px;
          top: 25%;
          right: 25%;
          animation: sparkleAnim 3s ease-in-out infinite, fadeUp 0.8s ease-out 0.7s both;
        }

        @keyframes floatCoin {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(8deg); }
          75% { transform: translateY(8px) rotate(-4deg); }
        }

        @keyframes floatBill {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-22px) rotate(3deg); }
        }

        @keyframes floatCoinSmall {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(12deg); }
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          33% { transform: translateY(-16px) rotate(2deg); }
          66% { transform: translateY(6px) rotate(-1deg); }
        }

        @keyframes floatBill2 {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(-20px) rotate(-4deg); }
        }

        @keyframes sparkleAnim {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.3) rotate(30deg); opacity: 1; }
        }

        /* ─── PACKAGES ───────────────────────────── */
        .packages-section {
          background-color: var(--color-background);
        }

        .section-header {
          margin-bottom: 64px;
        }

        .section-header.text-center {
          text-align: center;
        }

        .section-header h2 {
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 18px;
          max-width: 520px;
          color: var(--color-text-secondary);
        }

        .scope-note {
          margin-top: 16px;
          font-size: 14px;
          color: var(--color-text-muted);
          max-width: 600px;
          line-height: 1.6;
        }

        .section-header.text-center .section-subtitle {
          margin: 0 auto;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .package-card {
          display: flex;
          flex-direction: column;
          padding: 36px;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .package-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
        }

        .package-card.featured {
          border-color: var(--color-accent);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);
        }

        .package-card.featured:hover {
          box-shadow: 0 16px 48px rgba(37, 99, 235, 0.12);
        }

        .featured-badge {
          position: absolute;
          top: 16px;
          right: -32px;
          background: var(--color-accent);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 40px;
          transform: rotate(45deg);
          letter-spacing: 0.03em;
        }

        .package-header {
          margin-bottom: 20px;
        }

        .package-icon {
          font-size: 28px;
          display: block;
          margin-bottom: 14px;
        }

        .package-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .package-best-for {
          font-size: 14px;
          color: var(--color-text-muted);
          margin: 0;
        }

        .package-price {
          padding: 16px 0;
          margin-bottom: 20px;
          border-top: 1px solid var(--color-border-light);
          border-bottom: 1px solid var(--color-border-light);
        }

        .price-amount {
          font-size: 26px;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .package-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          flex-grow: 1;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14.5px;
          color: var(--color-text-secondary);
          padding: 6px 0;
          line-height: 1.5;
        }

        .check {
          color: var(--color-accent);
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .package-audience {
          margin-bottom: 24px;
        }

        .audience-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 10px;
        }

        .audience-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .audience-tag {
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(37, 99, 235, 0.06);
          color: var(--color-accent);
          font-weight: 500;
        }

        .package-card :global(.btn) {
          width: 100%;
          text-align: center;
        }

        /* ─── ADD-ONS ────────────────────────────── */
        .addons-section {
          background-color: var(--color-background-white);
        }

        .addons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .addon-card {
          padding: 32px;
        }

        .addon-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .addon-icon {
          font-size: 22px;
        }

        .addon-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .addon-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border-light);
          gap: 12px;
        }

        .addon-item:last-child {
          border-bottom: none;
        }

        .addon-name {
          font-size: 14.5px;
          color: var(--color-text-secondary);
        }

        .addon-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
        }

        /* ─── PROJECT TERMS ──────────────────────── */
        .terms-section {
          background-color: var(--color-background);
        }

        .terms-card {
          background: var(--color-background-white);
          border: 1px solid var(--color-border-light);
          border-radius: 16px;
          padding: 56px;
          max-width: 900px;
          margin: 0 auto;
          border-left: 4px solid var(--color-accent);
        }

        .terms-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .terms-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 16px;
        }

        .terms-title {
          font-size: 30px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }

        .terms-subtitle {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .terms-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .term-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 10px;
          background: var(--color-background);
          transition: background var(--transition-fast);
        }

        .term-item:hover {
          background: rgba(37, 99, 235, 0.04);
        }

        .term-number {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-accent);
          min-width: 24px;
          line-height: 1.6;
        }

        .term-text {
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        /* ─── FINAL CTA ──────────────────────────── */
        .cta-section {
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 42px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          color: var(--color-text-primary);
        }

        .cta-subtitle {
          font-size: 18px;
          color: var(--color-text-secondary);
          margin-bottom: 40px;
        }

        /* ─── ANIMATIONS ─────────────────────────── */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* ─── RESPONSIVE ─────────────────────────── */
        @media (max-width: 1024px) {
          .hero-wrapper {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .hero-visual {
            height: 280px;
            max-width: 400px;
            margin: 0 auto;
          }

          .hero-title {
            font-size: 46px;
          }

          .packages-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .addons-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .pricing-hero {
            padding: 120px 0 64px;
          }

          .hero-visual {
            display: none;
          }

          .hero-wrapper {
            text-align: left;
          }

          .hero-content {
            align-items: flex-start;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 17px;
          }

          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .packages-grid {
            grid-template-columns: 1fr;
          }

          .addons-grid {
            grid-template-columns: 1fr;
          }

          .terms-card {
            padding: 32px 24px;
          }

          .terms-grid {
            grid-template-columns: 1fr;
          }

          .cta-title {
            font-size: 32px;
          }

          .featured-badge {
            font-size: 11px;
            top: 12px;
            right: -36px;
          }
        }
      `}</style>
    </div>
  )
}
