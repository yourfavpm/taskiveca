'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PROJECT_TYPES } from '@/lib/types'
import CalendlyWidget from '@/components/CalendlyWidget'
import Link from 'next/link'

const COUNTRIES = [
  { name: 'Canada', code: 'CA', prefix: '+1' },
  { name: 'United States', code: 'US', prefix: '+1' },
  { name: 'United Kingdom', code: 'GB', prefix: '+44' },
]

export default function BookConsultation() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    country: 'Canada',
    project_type: '',
    estimated_start_time: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [countrySearch, setCountrySearch] = useState('Canada')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // Filter countries only if search is NOT matching the current selection exactly
  const filteredCountries = countrySearch.toLowerCase() === formState.country.toLowerCase() 
    ? COUNTRIES 
    : COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))

  const selectedCountry = COUNTRIES.find(c => c.name === formState.country) || COUNTRIES[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleCountrySelect = (countryName: string) => {
    setFormState(prev => ({ ...prev, country: countryName }))
    setCountrySearch(countryName)
    setShowCountryDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: submitError } = await supabase
        .rpc('submit_consultation', {
          p_name: formState.name,
          p_email: formState.email,
          p_phone: `${selectedCountry.prefix} ${formState.phone}`.trim(),
          p_company: formState.company,
          p_website: formState.website,
          p_country: formState.country,
          p_project_type: formState.project_type,
          p_estimated_start_time: formState.estimated_start_time,
          p_description: formState.description
        })

      if (submitError) throw submitError

      if (data) {
        setConsultationId(data)
      }
      setSubmitted(true)
    } catch (err: unknown) {
      console.error('Error submitting consultation:', err)
      const message = err instanceof Error ? err.message : 'There was an error submitting your request. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEventScheduled = async () => {
    if (!consultationId) return
    try {
      const supabase = createClient()
      await supabase
        .from('consultations')
        .update({ status: 'scheduled' })
        .eq('id', consultationId)
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  if (submitted) {
    return (
      <div className="consultation-page success-view">
        <div className="container">
          <div className="success-content">
            <div className="success-badge">✓</div>
            <h1>Request Received!</h1>
            <p>To finalize your consultation, please pick a time that works for you below. We&apos;ll prepare for our call based on the details you provided.</p>
            
            <div className="calendly-frame">
              <CalendlyWidget 
                prefill={{ name: formState.name, email: formState.email }} 
                onEventScheduled={handleEventScheduled}
              />
            </div>

            <div className="success-footer">
              <Link href="/" className="back-link">
                ← Return to Homepage
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .consultation-page { padding: 120px 0; min-height: 100vh; background: #fff; }
          .success-content { max-width: 600px; margin: 0 auto; text-align: center; }
          .success-badge { 
            width: 56px; height: 56px; background: #10B981; color: #fff; 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; 
            font-size: 24px; margin: 0 auto 24px; 
          }
          h1 { font-size: 32px; font-weight: 700; color: #111; margin-bottom: 16px; letter-spacing: -0.02em; }
          p { font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 40px; }
          .calendly-frame { 
            background: #fafafa; border: 1px solid #eaeaea; border-radius: 20px; 
            overflow: hidden; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          }
          .back-link { color: #666; font-size: 14px; text-decoration: none; transition: color 0.2s; }
          .back-link:hover { color: #111; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="consultation-page">
      <div className="container">
        <div className="grid-layout">
          {/* Left Column: Information */}
          <div className="info-column">
            <div className="sticky-content">
              <div className="tag">Book a Consultation</div>
              <h1 className="title">Let&apos;s build something <br/>great together.</h1>
              <p className="subtitle">
                Whether you have a fully scoped project or just an idea, we&apos;re here to help you navigate the technical journey.
              </p>

              <div className="process-list mobile-hidden">
                <div className="process-item">
                  <div className="process-num">01</div>
                  <div className="process-text">
                    <h4>Discovery Call</h4>
                    <p>A 30-minute deep dive into your goals, challenges, and vision for the project.</p>
                  </div>
                </div>
                <div className="process-item">
                  <div className="process-num">02</div>
                  <div className="process-text">
                    <h4>Strategy & Proposal</h4>
                    <p>We deliver a detailed roadmap, timeline, and fixed-price quote tailored to your needs.</p>
                  </div>
                </div>
                <div className="process-item">
                  <div className="process-num">03</div>
                  <div className="process-text">
                    <h4>Execution</h4>
                    <p>Transparent development with weekly demos and clear communication at every sprint.</p>
                  </div>
                </div>
              </div>

              <div className="trust-badge">
                <span className="dot" />
                Response guaranteed within 24 hours
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="form-column">
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="field-grid">
                <div className="field">
                  <label>Your Name *</label>
                  <input type="text" name="name" value={formState.name} onChange={handleChange} required placeholder="John Doe" />
                </div>
                <div className="field">
                  <label>Work Email *</label>
                  <input type="email" name="email" value={formState.email} onChange={handleChange} required placeholder="john@company.com" />
                </div>
              </div>

              <div className="field-grid">
                <div className="field country-field">
                  <label>Country *</label>
                  <div className="search-select">
                    <input 
                      type="text" 
                      value={countrySearch} 
                      onChange={(e) => {
                        setCountrySearch(e.target.value)
                        setShowCountryDropdown(true)
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      placeholder="Search country..."
                    />
                    {showCountryDropdown && (
                      <div className="dropdown">
                        {filteredCountries.map(c => (
                          <div 
                            key={c.code} 
                            className={`dropdown-item ${formState.country === c.name ? 'selected' : ''}`}
                            onClick={() => handleCountrySelect(c.name)}
                          >
                            <span>{c.name}</span>
                            {formState.country === c.name && <span className="check">✓</span>}
                          </div>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="dropdown-no-results">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="field">
                  <label>Phone Number *</label>
                  <div className="phone-input-group">
                    <span className="prefix">{selectedCountry.prefix}</span>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formState.phone} 
                      onChange={handleChange} 
                      required 
                      placeholder="000-000-0000" 
                    />
                  </div>
                </div>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label>Company (Optional)</label>
                  <input type="text" name="company" value={formState.company} onChange={handleChange} placeholder="Company name" />
                </div>
                <div className="field">
                  <label>Current Website (Optional)</label>
                  <input type="url" name="website" value={formState.website} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div className="field">
                <label>Project Type *</label>
                <select name="project_type" value={formState.project_type} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Estimated Start Time *</label>
                <select name="estimated_start_time" value={formState.estimated_start_time} onChange={handleChange} required>
                  <option value="">When should we start?</option>
                  <option value="Immediately">Immediately</option>
                  <option value="In 1-2 weeks">In 1-2 weeks</option>
                  <option value="In 1 month">In 1 month</option>
                  <option value="Planning phase">Planning phase</option>
                </select>
              </div>

              <div className="field">
                <label>Project Description *</label>
                <textarea 
                  name="description" 
                  value={formState.description} 
                  onChange={handleChange} 
                  required 
                  rows={4} 
                  placeholder="Tell us about the project goals, features, and any specific deadlines..."
                />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Request...' : 'Continue to Scheduling →'}
              </button>
              
              <p className="privacy-note">
                By submitting, you agree to being contacted regarding your project inquiry.
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .consultation-page { padding: 160px 0 100px; background: #fff; min-height: 100vh; }
        .grid-layout { display: grid; grid-template-columns: 1fr 1.1fr; gap: 100px; align-items: start; }
        
        /* Info Column */
        .info-column { position: relative; }
        .sticky-content { position: sticky; top: 120px; }
        .tag { 
          display: inline-block; padding: 6px 14px; background: #F3F4F6; border-radius: 100px; 
          font-size: 13px; font-weight: 600; color: #4B5563; margin-bottom: 24px;
        }
        .title { font-size: 56px; font-weight: 700; color: #111; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 24px; }
        .subtitle { font-size: 19px; color: #666; line-height: 1.6; margin-bottom: 48px; max-width: 480px; }
        
        .process-list { margin-bottom: 48px; }
        .process-item { display: flex; gap: 24px; margin-bottom: 32px; }
        .process-num { 
          font-size: 12px; font-weight: 700; color: #9CA3AF; padding-top: 4px; 
          font-family: monospace; 
        }
        .process-text h4 { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 6px; }
        .process-text p { font-size: 14px; color: #666; line-height: 1.5; }
        
        .trust-badge { 
          display: inline-flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: #10B981;
          padding: 10px 16px; background: rgba(16, 185, 129, 0.05); border-radius: 8px;
        }
        .dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; }

        /* Form Column */
        .booking-form { 
          background: #fff; border: 1px solid #eaeaea; border-radius: 24px; padding: 48px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04);
        }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .field input, .field select, .field textarea { 
          width: 100%; padding: 12px 16px; background: #F9FAFB; border: 1px solid #E5E7EB; 
          border-radius: 12px; font-size: 14px; transition: all 0.2s;
        }
        .field input:focus, .field select:focus, .field textarea:focus { 
          background: #fff; border-color: #2563EB; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .country-field { position: relative; }
        .search-select { position: relative; }
        .dropdown { 
          position: absolute; top: 100%; left: 0; right: 0; background: #fff; 
          border: 1px solid #E5E7EB; border-radius: 12px; margin-top: 4px; 
          max-height: 200px; overflow-y: auto; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .dropdown-item { 
          padding: 10px 16px; cursor: pointer; font-size: 14px; color: #374151;
          display: flex; justify-content: space-between; align-items: center;
        }
        .dropdown-item:hover { background: #F3F4F6; }
        .dropdown-item.selected { background: rgba(37, 99, 235, 0.05); color: #2563EB; font-weight: 600; }
        .check { font-size: 12px; }
        .dropdown-no-results { padding: 10px 16px; font-size: 14px; color: #9CA3AF; }

        .phone-input-group { display: flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; }
        .phone-input-group .prefix { padding: 0 12px; font-size: 14px; font-weight: 600; color: #6B7280; border-right: 1px solid #E5E7EB; }
        .phone-input-group input { border: none; background: transparent; padding-left: 12px; }
        .phone-input-group input:focus { border: none; box-shadow: none; }
        .phone-input-group:focus-within { background: #fff; border-color: #2563EB; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        
        .submit-button { 
          width: 100%; padding: 16px; background: #111; color: #fff; border: none; 
          border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; 
          transition: all 0.2s; margin-top: 12px;
        }
        .submit-button:hover { background: #333; transform: translateY(-1px); }
        .submit-button:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .error-box { padding: 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; color: #B91C1C; font-size: 13px; margin-bottom: 20px; }
        .privacy-note { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 20px; }

        @media (max-width: 1100px) {
          .grid-layout { gap: 60px; }
          .title { font-size: 44px; }
        }

        @media (max-width: 900px) {
          .consultation-page { padding: 100px 0 60px; }
          .grid-layout { grid-template-columns: 1fr; gap: 48px; }
          .title { font-size: 40px; margin-bottom: 16px; }
          .subtitle { font-size: 17px; margin-bottom: 32px; }
          .sticky-content { position: relative; top: 0; }
          .booking-form { padding: 32px; border-radius: 0; border-left: none; border-right: none; margin: 0 -20px; }
          .mobile-hidden { display: none; }
        }

        @media (max-width: 600px) {
          .field-grid { grid-template-columns: 1fr; gap: 0; }
          .title { font-size: 32px; }
          .consultation-page { padding: 80px 0 40px; }
        }
      `}</style>
    </div>
  )
}
