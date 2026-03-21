'use client'

// import { useState } from 'react'
import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'
// import { PROJECT_TYPES } from '@/lib/types'
// import CalendlyWidget from '@/components/CalendlyWidget'

export default function Hero() {
  /* 
  const COUNTRIES = [
    { name: 'Canada', code: 'CA', prefix: '+1' },
    { name: 'United States', code: 'US', prefix: '+1' },
    { name: 'United Kingdom', code: 'GB', prefix: '+44' },
  ]
  */

  /* 
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

      if (submitError) {
        console.error('Supabase error submitting consultation:', submitError)
        setError(`Error: ${submitError.message || 'Unknown error'}`)
        return
      }

      if (data) {
        setConsultationId(data)
      }
      setSubmitted(true)
    } catch (err: unknown) {
      console.error('Unexpected error submitting consultation:', err)
      const message = err instanceof Error ? err.message : 'Unknown network error. Please check your connection.'
      setError(`Error: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEventScheduled = async () => {
    if (!consultationId) return

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ status: 'scheduled' })
        .eq('id', consultationId)

      if (updateError) {
        console.error('Error updating consultation status:', updateError)
      }
    } catch (err: unknown) {
      console.error('Unexpected error updating status:', err)
    }
  }
  */

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="preview-tag">
              <span className="preview-tag-dot" />
              <span>See your site live — before you pay a dime</span>
              <span className="preview-tag-sparkle">✨</span>
            </div>
            <h1 className="hero-title">
              We design and build digital products that work.
            </h1>
            <p className="hero-subtitle">
              Taskive Tech is a Canadian studio-led product and engineering team building websites, platforms, and scalable systems.
            </p>
            <div className="hero-actions">
              <Link 
                href="https://calendly.com/taskive-dev/taskive-free-discovery-call" 
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Free Discovery Call
              </Link>
              <Link href="/pricing" className="btn btn-secondary">
              View Pricing
            </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="tech-orbit-system" aria-hidden="true">
              {/* --- Background Glows --- */}
              <div className="orbit-glow blob-blue"></div>
              <div className="orbit-glow blob-purple"></div>

              {/* --- Orbiting Tracks --- */}
              <div className="orbit-track track-1"></div>
              <div className="orbit-track track-2"></div>
              <div className="orbit-track track-3"></div>

              {/* --- Central Core --- */}
              <div className="center-core">
                <div className="core-inner">
                  <span className="core-logo">T</span>
                </div>
                <div className="core-rings">
                  <div className="ring r1"></div>
                  <div className="ring r2"></div>
                </div>
              </div>

              {/* --- Tech Logos --- */}
              {/* React */}
              <div className="tech-icon-wrap icon-react">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <circle cx="50" cy="50" r="10" fill="#61DAFB"/>
                  <ellipse cx="50" cy="50" rx="40" ry="15" stroke="#61DAFB" strokeWidth="2" fill="none"/>
                  <ellipse cx="50" cy="50" rx="40" ry="15" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(60 50 50)"/>
                  <ellipse cx="50" cy="50" rx="40" ry="15" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(120 50 50)"/>
                </svg>
              </div>

              {/* Next.js */}
              <div className="tech-icon-wrap icon-next">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2"/>
                  <path d="M35 70V30L65 70V30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>

              {/* TypeScript */}
              <div className="tech-icon-wrap icon-ts">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <rect width="100" height="100" fill="#3178C6" rx="10"/>
                  <text x="50" y="75" textAnchor="middle" fontSize="60" fill="white" fontWeight="bold" fontFamily="sans-serif">TS</text>
                </svg>
              </div>

              {/* Supabase */}
              <div className="tech-icon-wrap icon-supabase">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <path d="M20 50L50 10L50 40L80 40L50 90L50 60L20 60Z" fill="#3ECF8E"/>
                </svg>
              </div>

              {/* Tailwind */}
              <div className="tech-icon-wrap icon-tailwind">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <path d="M50 30C50 30 55 15 75 15C95 15 95 35 95 35C95 35 90 50 70 50C50 50 45 65 25 65C5 65 5 45 5 45C5 45 10 30 30 30C50 30 50 30 50 30Z" fill="#38B2AC"/>
                  <path d="M50 65C50 65 55 50 75 50C95 50 95 70 95 70C95 70 90 85 70 85C50 85 45 100 25 100C5 100 5 80 5 80C5 80 10 65 30 65C50 65 50 65 50 65Z" fill="#38B2AC" opacity="0.6"/>
                </svg>
              </div>

              {/* Node.js */}
              <div className="tech-icon-wrap icon-node">
                <svg viewBox="0 0 100 100" className="tech-logo">
                  <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" fill="#339933"/>
                  <text x="50" y="60" textAnchor="middle" fontSize="24" fill="white" fontWeight="bold">JS</text>
                </svg>
              </div>

              {/* --- Particles --- */}
              <div className="particle-system">
                <div className="particle p1">{"</>"}</div>
                <div className="particle p2">{"{ }"}</div>
                <div className="particle p3">SQL</div>
                <div className="particle p4">API</div>
                <div className="particle p5">JSX</div>
              </div>
            </div>

            {/* Form commented out below for possible later retrieval */}
            {/*
            <div className="booking-card">
              {submitted ? (
                <div className="success-state">
                  <div className="success-icon">✓</div>
                  <h3>Request Received!</h3>
                  <p>Thanks for your interest. To finalize your consultation, please pick a time that works for you below:</p>
                  <div className="calendly-wrapper">
                    <CalendlyWidget 
                      prefill={{ name: formState.name, email: formState.email }} 
                      onEventScheduled={handleEventScheduled}
                    />
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
                    <div className="form-group country-field">
                      <div className="search-select">
                        <input 
                          type="text" 
                          value={countrySearch} 
                          className="form-input"
                          onChange={(e) => {
                            setCountrySearch(e.target.value)
                            setShowCountryDropdown(true)
                          }}
                          onFocus={() => setShowCountryDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                          placeholder="Country"
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
                              <div className="dropdown-no-results">No results</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="phone-input-group">
                        <span className="prefix">{selectedCountry.prefix}</span>
                        <input 
                          type="tel" 
                          name="phone" 
                          className="form-input phone-no-border"
                          value={formState.phone} 
                          onChange={handleChange} 
                          required 
                          placeholder="Phone Number" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
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
                    <div className="form-group">
                      <input
                        type="url"
                        name="website"
                        placeholder="Website (Optional)"
                        className="form-input"
                        value={formState.website}
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
                      rows={2}
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
            */}
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

        .preview-tag {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          border-radius: 100px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(139, 92, 246, 0.06));
          border: 1px solid rgba(37, 99, 235, 0.12);
          font-size: 14px;
          font-weight: 500;
          color: #1e40af;
          margin-bottom: 24px;
          animation: tagFadeIn 0.8s ease-out;
          position: relative;
          overflow: hidden;
        }

        .preview-tag::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: tagShimmer 3s ease-in-out infinite;
        }

        .preview-tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: tagPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .preview-tag-sparkle {
          font-size: 14px;
          animation: tagBounce 2s ease-in-out infinite;
        }

        @keyframes tagFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes tagShimmer {
          0%, 100% { left: -100%; }
          50% { left: 100%; }
        }

        @keyframes tagPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes tagBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .hero-title {
          font-size: 64px;
          line-height: 1.1;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 24px;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 40px;
          max-width: 540px;
        }


        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .hero-visual {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── TECH ORBIT SYSTEM ─────────────────── */
        .tech-orbit-system {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
        }

        /* Background Glows */
        .orbit-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 1;
        }
        .blob-blue { background: #2563EB; top: 10%; left: 10%; animation: floatGlow 8s ease-in-out infinite; }
        .blob-purple { background: #8B5CF6; bottom: 10%; right: 10%; animation: floatGlow 10s ease-in-out infinite reverse; }

        @keyframes floatGlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }

        /* Orbit Tracks */
        .orbit-track {
          position: absolute;
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 50%;
          z-index: 2;
        }
        .track-1 { width: 180px; height: 180px; }
        .track-2 { width: 320px; height: 320px; }
        .track-3 { width: 460px; height: 460px; }

        /* Central Core */
        .center-core {
          position: relative;
          width: 80px;
          height: 80px;
          z-index: 10;
        }
        .core-inner {
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
          animation: corePulse 4s ease-in-out infinite;
        }
        .core-logo {
          color: #fff;
          font-size: 40px;
          font-weight: 800;
          font-family: serif;
        }
        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid var(--color-accent);
          border-radius: 50%;
          opacity: 0;
        }
        .r1 { width: 80px; height: 80px; animation: ringExpand 4s linear infinite; }
        .r2 { width: 80px; height: 80px; animation: ringExpand 4s linear infinite 2s; }

        @keyframes corePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(0, 0, 0, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(37, 99, 235, 0.3); }
        }
        @keyframes ringExpand {
          0% { width: 80px; height: 80px; opacity: 0.5; border-width: 2px; }
          100% { width: 160px; height: 160px; opacity: 0; border-width: 0px; }
        }

        /* Tech Icons */
        .tech-icon-wrap {
          position: absolute;
          width: 48px;
          height: 48px;
          z-index: 5;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
          transition: transform 0.3s ease;
        }
        .tech-logo { width: 100%; height: 100%; }

        /* Orbit Animations */
        .icon-react { animation: orbit1 15s linear infinite; }
        .icon-next { animation: orbit1 15s linear infinite -7.5s; }
        .icon-ts { animation: orbit2 20s linear infinite; }
        .icon-supabase { animation: orbit2 20s linear infinite -10s; }
        .icon-tailwind { animation: orbit3 25s linear infinite; }
        .icon-node { animation: orbit3 25s linear infinite -12.5s; }

        @keyframes orbit1 {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg) scale(1); }
          to { transform: rotate(360deg) translateX(90px) rotate(-360deg) scale(1); }
        }
        @keyframes orbit2 {
          from { transform: rotate(0deg) translateX(160px) rotate(0deg) scale(1); }
          to { transform: rotate(360deg) translateX(160px) rotate(-360deg) scale(1); }
        }
        @keyframes orbit3 {
          from { transform: rotate(0deg) translateX(230px) rotate(0deg) scale(1); }
          to { transform: rotate(360deg) translateX(230px) rotate(-360deg) scale(1); }
        }

        .tech-icon-wrap:hover {
          z-index: 20;
          filter: drop-shadow(0 0 15px var(--color-accent));
        }

        /* Particles */
        .particle {
          position: absolute;
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-accent);
          opacity: 0.4;
          z-index: 3;
        }
        .p1 { top: 20%; left: 10%; animation: floatP 6s ease-in-out infinite; }
        .p2 { top: 70%; right: 15%; animation: floatP 7s ease-in-out infinite 1s; }
        .p3 { bottom: 15%; left: 20%; animation: floatP 8s ease-in-out infinite 0.5s; }
        .p4 { top: 10%; right: 30%; animation: floatP 5s ease-in-out infinite 1.5s; }
        .p5 { bottom: 30%; right: 5%; animation: floatP 9s ease-in-out infinite 2s; }

        @keyframes floatP {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(10px, -20px); opacity: 0.2; }
        }

        /* Form styles commented out for later retrieval */
        /*
        .booking-card {
          background: #ffffff;
          border: 1px solid var(--color-border-light);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.08);
          max-width: 520px;
          margin-left: auto;
          transition: all 0.3s ease;
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

        .country-field { position: relative; }
        .search-select { position: relative; }
        .dropdown { 
          position: absolute; top: 100%; left: 0; right: 0; background: #fff; 
          border: 1px solid #E5E7EB; border-radius: 12px; margin-top: 4px; 
          max-height: 150px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .dropdown-item { 
          padding: 8px 12px; cursor: pointer; font-size: 13px; color: #374151;
          display: flex; justify-content: space-between; align-items: center;
          text-align: left;
        }
        .dropdown-item:hover { background: #F3F4F6; }
        .dropdown-item.selected { background: rgba(37, 99, 235, 0.05); color: #2563EB; font-weight: 600; }
        .check { font-size: 12px; }
        .dropdown-no-results { padding: 8px 12px; font-size: 13px; color: #9CA3AF; }

        .phone-input-group { 
          display: flex; 
          align-items: center; 
          background: #fff; 
          border: 1px solid #e5e7eb; 
          border-radius: 12px;
          transition: all 0.2s;
        }
        .phone-input-group .prefix { 
          padding: 0 12px; 
          font-size: 14px; 
          font-weight: 600; 
          color: #6B7280; 
          border-right: 1px solid #E5E7EB; 
        }
        .phone-no-border { border: none !important; box-shadow: none !important; }
        .phone-input-group:focus-within { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

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
        */

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
            font-size: 48px;
          }

          .hero-visual {
            min-height: 400px;
            transform: scale(0.8);
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 0 60px;
          }

          .hero-title {
            font-size: 34px;
            letter-spacing: -0.02em;
          }

          .hero-subtitle {
            font-size: 16px;
            max-width: 100%;
          }

          .hero-visual {
            display: none;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .hero-actions .btn {
            width: 100%;
            padding: 14px 24px;
            font-size: 15px;
          }
        }

      `}</style>
    </section>
  )
}
