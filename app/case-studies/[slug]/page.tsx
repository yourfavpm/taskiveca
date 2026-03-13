'use client'

import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CaseStudy } from '@/lib/types'

export default function CaseStudyPage() {
  const params = useParams()
  const slug = params.slug as string
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCaseStudy() {
      if (!slug) return
      
      setIsLoading(true)
      let decodedSlug = slug
      try {
        // Handle potential multiple encodings
        while (decodedSlug.includes('%')) {
          decodedSlug = decodeURIComponent(decodedSlug)
        }
      } catch (e) {
        console.warn('Error decoding slug:', e)
      }
      
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, summary, industry, challenge, solution, process, images, outcome, published, slug, featured, created_at, updated_at')
        .eq('slug', decodedSlug)
        .eq('published', true)
        .maybeSingle()

      if (error) {
        console.error('Error fetching case study:', error)
      } else if (!data) {
        console.warn(`Case study not found for slug: ${decodedSlug}`)
      } else {
        setCaseStudy(data)
      }
      setIsLoading(false)
    }

    fetchCaseStudy()
  }, [slug, supabase])

  if (isLoading) {
    return <div className="loading-state">Loading project...</div>
  }

  if (!caseStudy) {
    notFound()
  }

  // Ensure arrays exist
  const processSteps = Array.isArray(caseStudy.process) ? caseStudy.process : []
  const projectImages = Array.isArray(caseStudy.images) ? caseStudy.images : []

  return (
    <div className="case-study-page">
      {/* Hero Section */}
      <section className="case-hero">
        <div className="container">
          <Link href="/#work" className="back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Work
          </Link>

          <div className="hero-content">
            <span className="industry-tag">{caseStudy.industry || 'Project'}</span>
            <h1>{caseStudy.title}</h1>
            <p className="hero-summary">{caseStudy.summary}</p>
          </div>
        </div>
      </section>

      {/* Project Images */}
      {projectImages.length > 0 ? (
        <section className="project-showcase">
          <div className="container">
            <div className="showcase-grid">
              {projectImages.map((img, idx) => (
                <div key={idx} className="showcase-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${caseStudy.title} - showcase ${idx + 1}`} style={{ width: '100%', height: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="project-showcase">
          <div className="container">
            <div className="showcase-image">
              <div className="image-placeholder">
                <span>{caseStudy.title.charAt(0)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <section className="content-section">
        <div className="container">
          <div className="content-grid">
            {/* Challenge */}
            <div className="content-block">
              <div className="block-header">
                <span className="block-number">01</span>
                <h2>The Challenge</h2>
              </div>
              <p>{caseStudy.challenge}</p>
            </div>

            {/* Solution */}
            <div className="content-block">
              <div className="block-header">
                <span className="block-number">02</span>
                <h2>The Solution</h2>
              </div>
              <p>{caseStudy.solution}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      {processSteps.length > 0 && (
        <section className="process-section">
          <div className="container">
            <div className="process-header">
              <span className="block-number">03</span>
              <h2>The Process</h2>
            </div>
            <div className="process-timeline">
              {processSteps.map((step, index) => (
                <div key={index} className="process-step">
                  <div className="step-indicator">
                    <span className="step-dot"></span>
                    {index < processSteps.length - 1 && <span className="step-line"></span>}
                  </div>
                  <div className="step-content">
                    <span className="step-number">Step {index + 1}</span>
                    <p>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcome Section */}
      <section className="outcome-section">
        <div className="container">
          <div className="outcome-content">
            <div className="outcome-header">
              <span className="block-number">04</span>
              <h2>The Outcome</h2>
            </div>
            <p className="outcome-text">{caseStudy.outcome}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Have a similar project in mind?</h2>
            <p>Let&apos;s discuss how we can help you achieve similar results.</p>
            <Link href="/book-consultation" className="btn btn-primary">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .case-study-page {
          padding-top: 72px;
        }

        .loading-state {
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #666;
        }

        /* Hero Section */
        .case-hero {
          padding: 64px 0 80px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          margin-bottom: 48px;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: var(--color-text-primary);
        }

        .hero-content {
          max-width: 800px;
        }

        .industry-tag {
          display: inline-block;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-accent);
          background-color: rgba(37, 99, 235, 0.08);
          border-radius: 100px;
          margin-bottom: 24px;
        }

        .case-hero h1 {
          font-size: 56px;
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
          margin-bottom: 24px;
        }

        .hero-summary {
          font-size: 22px;
          line-height: 1.5;
          color: var(--color-text-secondary);
          max-width: 640px;
        }

        /* Project Showcase */
        .project-showcase {
          padding: 0 0 80px;
          background: linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%);
        }

        .showcase-grid {
           display: flex;
           flex-direction: column;
           gap: 40px;
        }

        .showcase-image {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.08);
        }

        .showcase-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .image-placeholder {
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, #E8ECEF 0%, #D1D9E0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder span {
          font-size: 120px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.08);
        }

        /* Content Sections */
        .content-section {
          padding: 96px 0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 64px;
        }

        .content-block {
          padding: 40px;
          background-color: #FFFFFF;
          border: 1px solid var(--color-border-light);
          border-radius: 16px;
        }

        .block-header {
          margin-bottom: 24px;
        }

        .block-number {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-accent);
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }

        .block-header h2 {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .content-block p {
          font-size: 17px;
          line-height: 1.8;
          color: var(--color-text-secondary);
        }

        /* Process Section */
        .process-section {
          padding: 96px 0;
          background-color: #FFFFFF;
        }

        .process-header {
          margin-bottom: 48px;
        }

        .process-header h2 {
          font-size: 32px;
          font-weight: 600;
        }

        .process-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 600px;
        }

        .process-step {
          display: flex;
          gap: 24px;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 6px;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          background-color: var(--color-accent);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step-line {
          width: 2px;
          flex-grow: 1;
          background-color: var(--color-border);
          min-height: 40px;
        }

        .step-content {
          padding-bottom: 32px;
        }

        .step-number {
          display: block;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }

        .step-content p {
          font-size: 18px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin: 0;
        }

        /* Outcome Section */
        .outcome-section {
          padding: 96px 0;
          background: linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%);
        }

        .outcome-content {
          max-width: 720px;
        }

        .outcome-header {
          margin-bottom: 32px;
        }

        .outcome-header h2 {
          font-size: 32px;
          font-weight: 600;
        }

        .outcome-text {
          font-size: 20px;
          line-height: 1.8;
          color: var(--color-text-secondary);
        }

        /* CTA Section */
        .cta-section {
          padding: 120px 0;
          background-color: var(--color-text-primary);
          text-align: center;
        }

        .cta-content {
          max-width: 560px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 40px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .cta-content p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
        }

        .cta-section :global(.btn-primary) {
          background-color: #FFFFFF;
          color: var(--color-text-primary);
          padding: 16px 32px;
          font-size: 16px;
        }

        .cta-section :global(.btn-primary:hover) {
          background-color: rgba(255, 255, 255, 0.9);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        @media (max-width: 768px) {
          .case-hero {
            padding: 48px 0 64px;
          }

          .case-hero h1 {
            font-size: 36px;
          }

          .hero-summary {
            font-size: 18px;
          }

          .content-section,
          .process-section,
          .outcome-section {
            padding: 64px 0;
          }

          .content-block {
            padding: 28px;
          }

          .cta-section {
            padding: 80px 0;
          }

          .cta-content h2 {
            font-size: 28px;
          }

          .image-placeholder span {
            font-size: 72px;
          }
        }
      `}</style>
    </div>
  )
}
