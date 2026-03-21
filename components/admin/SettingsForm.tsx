'use client'

import { useState, useEffect } from 'react'
import { CompanySettings } from '@/lib/types'

interface SettingsFormProps {
    settings: CompanySettings
    onSave: (settings: CompanySettings) => Promise<void>
}

export default function SettingsForm({ settings, onSave }: SettingsFormProps) {
    const [formData, setFormData] = useState<CompanySettings>(settings)
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    // Update form data if initial settings change (e.g. after fetch)
    useEffect(() => {
        setFormData(settings)
    }, [settings])

    const handleChange = (field: keyof CompanySettings, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await onSave(formData)
        setSaving(false)
        setIsDirty(false)
    }

    return (
        <div className="settings-container">
            <div className="header">
                <h1>Company Settings</h1>
                <p>These details will be displayed in the website footer and contact sections.</p>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-section">
                    <h3>Contact Information</h3>

                    <div className="form-group">
                        <label>Public Email Address</label>
                        <input
                            type="email"
                            value={formData.contact_email || ''}
                            onChange={(e) => handleChange('contact_email', e.target.value)}
                            placeholder="hello@taskive.tech"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={formData.contact_phone || ''}
                            onChange={(e) => handleChange('contact_phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="form-group">
                        <label>Physical Address</label>
                        <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={3}
                            placeholder="123 Innovation Dr, Tech City..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Social Media</h3>

                    <div className="form-group">
                        <label>Facebook URL</label>
                        <input
                            type="url"
                            value={formData.social_tiktok || ''}
                            onChange={(e) => handleChange('social_tiktok', e.target.value)}
                            placeholder="https://facebook.com/..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram URL</label>
                        <input
                            type="url"
                            value={formData.social_instagram || ''}
                            onChange={(e) => handleChange('social_instagram', e.target.value)}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className={`save-btn ${isDirty ? 'active' : ''}`}
                        disabled={!isDirty || saving}
                    >
                        {saving ? 'Saving...' : (isDirty ? 'Save Changes' : 'Saved')}
                    </button>
                </div>
            </form>

            <style jsx>{`
        .settings-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .header { margin-bottom: 40px; }
        .header h1 { font-size: 28px; font-weight: 700; color: #111; margin-bottom: 8px; }
        .header p { color: #666; font-size: 15px; }

        .settings-form {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .form-section { margin-bottom: 40px; }
        .form-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }

        .form-group { margin-bottom: 24px; }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          margin-bottom: 8px;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
          color: #111;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group textarea:focus {
          border-color: #2563EB;
          outline: none;
        }

        .form-actions {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid #eaeaea;
        }

        .save-btn {
          padding: 12px 32px;
          background: #eee;
          color: #888;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: not-allowed;
          transition: all 0.2s;
        }

        .save-btn.active {
          background: #2563EB;
          color: #fff;
          cursor: pointer;
        }
        
        .save-btn.active:hover {
          background: #1d4ed8;
        }
      `}</style>
        </div>
    )
}
