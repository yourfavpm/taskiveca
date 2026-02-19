'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PROJECT_TYPES } from '@/lib/types'
import CalendlyWidget from '@/components/CalendlyWidget'

export default function Hero() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    country: 'Canada',
    project_type: '',
    estimated_start_time: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: submitError } = await supabase
        .from('consultations')
        .insert([formState])

      if (submitError) {
        console.error('Supabase error submitting consultation:', submitError)
        setError(`Error: ${submitError.message || 'Unknown error'}`)
        return
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Unexpected error submitting consultation:', err)
      setError(`Error: ${err.message || 'Unknown network error. Please check your connection.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              We design and build digital products that work.
            </h1>
            <p className="hero-subtitle">
              Taskive Tech is a Canadian studio-led product and engineering team building websites, platforms, and scalable systems.
            </p>
            <div className="hero-actions">
              <Link href="/#work" className="btn btn-secondary">
                View Our Work
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="booking-card">
              {submitted ? (
                <div className="success-state">
                  <div className="success-icon">✓</div>
                  <h3>Request Received!</h3>
                  <p>Thanks for your interest. To finalize your consultation, please pick a time that works for you below:</p>
                  <div className="calendly-wrapper">
                    <CalendlyWidget prefill={{ name: formState.name, email: formState.email }} />
                  </div>
                  <button onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm mt-4">Send another request</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="hero-form">
                  <div className="form-header">
                    <h3>Book a Consultation</h3>
                    <p>Get a response within 24 hours.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="form-input"
                        value={formState.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Work Email"
                        className="form-input"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        className="form-input"
                        value={formState.country}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="company"
                        placeholder="Company (Optional)"
                        className="form-input"
                        value={formState.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <select
                        name="project_type"
                        className="form-select"
                        value={formState.project_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Project Type</option>
                        {PROJECT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <select
                        name="estimated_start_time"
                        className="form-select"
                        value={formState.estimated_start_time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Start Time</option>
                        <option value="Immediately">Immediately</option>
                        <option value="In 1-2 weeks">In 1-2 weeks</option>
                        <option value="In 1 month">In 1 month</option>
                        <option value="Planning phase">Planning phase</option>
                      </select>
                    </div>
                  </div>


                  <div className="form-group">
                    <textarea
                      name="description"
                      placeholder="Briefly describe your project..."
                      className="form-textarea"
                      rows={3}
                      value={formState.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {error && <p className="error-text">{error}</p>}

                  <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Book Consultation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          padding: 160px 0 100px;
          background-color: var(--color-background-white);
          overflow: hidden;
        }

        .hero-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 80px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 64px;
          font-weight: 600;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: var(--color-text-primary);
          margin-bottom: 24px;
        }

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 40px;
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .hero-visual {
          position: relative;
        }

        .booking-card {
          background: #ffffff;
          border: 1px solid var(--color-border-light);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.08);
          max-width: 480px;
          margin-left: auto;
        }

        .form-header {
          margin-bottom: 24px;
        }

        .form-header h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .form-header p {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--color-accent);
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .w-full {
          width: 100%;
        }

        .error-text {
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .success-state {
          text-align: center;
          padding: 20px 0;
        }

        .success-icon {
          width: 48px;
          height: 48px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin: 0 auto 16px;
        }

        .success-state h3 {
          margin-bottom: 8px;
        }

        .success-state p {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .calendly-wrapper {
          margin-top: 20px;
          border-radius: 12px;
          overflow: hidden;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .mt-4 {
          margin-top: 16px;
        }

        @media (max-width: 1024px) {
          .hero-wrapper {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }

          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .hero-title {
            font-size: 52px;
          }

          .booking-card {
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 120px 0 60px;
          }

          .hero-title {
            font-size: 40px;
          }

          .hero-subtitle {
            font-size: 18px;
          }

          .booking-card {
            padding: 24px;
          }
        }
      `}</style>
    </section>
  )
}
