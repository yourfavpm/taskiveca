'use client'

import Link from 'next/link'

const pricingModels = [
  {
    title: 'Fixed Project',
    description: 'Best for well-defined projects with clear scope and deliverables.',
    features: [
      'Defined scope & timeline',
      'Fixed budget',
      'Milestone-based delivery',
      'Full ownership on completion',
    ],
    cta: 'Get a Quote',
  },
  {
    title: 'Monthly Retainer',
    description: 'Ongoing development and support for evolving products.',
    features: [
      'Dedicated hours per month',
      'Flexible priorities',
      'Continuous improvement',
      'Predictable costs',
    ],
    cta: 'Learn More',
    featured: true,
  },
  {
    title: 'Product Partnership',
    description: 'We build and grow the product with you, aligned on outcomes.',
    features: [
      'Equity or revenue share',
      'Long-term commitment',
      'Strategic collaboration',
      'Shared success',
    ],
    cta: 'Discuss Options',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="pricing section">
      <div className="container">
        <div className="section-header">
          <h2>Engagement Models</h2>
          <p className="section-subtitle">
            Choose the model that fits your project and goals.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingModels.map((model, index) => (
            <div
              key={index}
              className={`pricing-card card ${model.featured ? 'featured' : ''}`}
            >
              <h3 className="pricing-title">{model.title}</h3>
              <p className="pricing-description">{model.description}</p>
              <ul className="pricing-features">
                {model.features.map((feature, i) => (
                  <li key={i} className="pricing-feature">
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/book-consultation" className={`btn ${model.featured ? 'btn-primary' : 'btn-secondary'}`}>
                {model.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="pricing-note">
          <p>
            <strong>Note on Pricing:</strong> Prices are in CAD unless otherwise specified. Final cost is determined by project scope, technical complexity, and specific feature requirements.
            We provide a detailed custom quote following a thorough discovery call to ensure our proposal aligns perfectly with your goals.
          </p>
        </div>
      </div>

      <style jsx>{`
        .pricing {
          background-color: var(--color-background);
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-header h2 {
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 18px;
          max-width: 480px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }

        .pricing-note {
          margin-top: 48px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid var(--color-border-light);
          border-radius: 12px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .pricing-note p {
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .pricing-card {
          display: flex;
          flex-direction: column;
          padding: 36px;
        }

        .pricing-card.featured {
          border-color: var(--color-accent);
          background-color: var(--color-background-white);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);
        }

        .pricing-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text-primary);
        }

        .pricing-description {
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          flex-grow: 1;
        }

        .pricing-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 15px;
          color: var(--color-text-secondary);
          padding: 8px 0;
        }

        .check {
          color: var(--color-accent);
          font-weight: 600;
        }

        .pricing-card :global(.btn) {
          width: 100%;
        }

        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  )
}
