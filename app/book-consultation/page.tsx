'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PROJECT_TYPES } from '@/lib/types'
import CalendlyWidget from '@/components/CalendlyWidget'
import Link from 'next/link'

export default function BookConsultation() {
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

      if (submitError) throw submitError

      setSubmitted(true)
    } catch (err: any) {
      console.error('Error submitting consultation:', err)
      setError(err.message || 'There was an error submitting your request. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="consultation-page">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h1>Thank you!</h1>
            <p>We&apos;ve received your request. To finalize your consultation, please pick a time that works for you below:</p>
            <div className="calendly-wrapper">
              <CalendlyWidget prefill={{ name: formState.name, email: formState.email }} />
            </div>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>

        <style jsx>{`
          .consultation-page {
            padding-top: 72px;
            min-height: 100vh;
            display: flex;
            align-items: center;
          }

          .success-message {
            text-align: center;
            max-width: 480px;
            margin: 0 auto;
            padding: 80px 0;
          }

          .success-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: #10B981;
            color: white;
            font-size: 28px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }

          .success-message h1 {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .success-message p {
            font-size: 17px;
            color: var(--color-text-secondary);
            margin-bottom: 32px;
          }

          .calendly-wrapper {
            margin-bottom: 40px;
            border-radius: 12px;
            overflow: hidden;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="consultation-page">
      <div className="container">
        <div className="page-header">
          <h1>Book a Consultation</h1>
          <p>Tell us about your project. We&apos;ll get back to you within 1-2 business days.</p>
        </div>

        <form onSubmit={handleSubmit} className="consultation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="company" className="form-label">Company (optional)</label>
              <input
                type="text"
                id="company"
                name="company"
                className="form-input"
                value={formState.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                className="form-input"
                value={formState.country}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="project_type" className="form-label">Project Type *</label>
              <select
                id="project_type"
                name="project_type"
                className="form-select"
                value={formState.project_type}
                onChange={handleChange}
                required
              >
                <option value="">Select a project type</option>
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estimated_start_time" className="form-label">Estimated Start Time *</label>
              <select
                id="estimated_start_time"
                name="estimated_start_time"
                className="form-select"
                value={formState.estimated_start_time}
                onChange={handleChange}
                required
              >
                <option value="">When should we start?</option>
                <option value="Immediately">Immediately</option>
                <option value="In 1-2 weeks">In 1-2 weeks</option>
                <option value="In 1 month">In 1 month</option>
                <option value="Planning phase">Planning phase</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Project Description *</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows={6}
              value={formState.description}
              onChange={handleChange}
              placeholder="Tell us about your project, goals, and timeline..."
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <strong>Error submitting request:</strong> {error}
              <p style={{ marginTop: '8px', fontSize: '13px' }}>
                If this persists, please contact us at <a href="mailto:info@taskivetech.tech">info@taskivetech.tech</a>
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .consultation-page {
          padding-top: 72px;
          min-height: 100vh;
          background-color: var(--color-background-white);
        }

        .page-header {
          max-width: 540px;
          padding: 80px 0 48px;
        }

        .page-header h1 {
          font-size: 42px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .page-header p {
          font-size: 18px;
          color: var(--color-text-secondary);
        }

        .consultation-form {
          max-width: 640px;
          padding-bottom: 80px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .error-message {
          padding: 16px;
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          color: #DC2626;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          font-size: 16px;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            padding: 60px 0 32px;
          }

          .page-header h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  )
}
