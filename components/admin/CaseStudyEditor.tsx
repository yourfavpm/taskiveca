import { useState, useEffect } from 'react'
import { CaseStudy } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface CaseStudyEditorProps {
    initialData?: CaseStudy | null
    existingSlugs?: string[]
    onSave: (data: Partial<CaseStudy>) => Promise<void>
    onCancel: () => void
}

export default function CaseStudyEditor({ initialData, existingSlugs = [], onSave, onCancel }: CaseStudyEditorProps) {
    const [formData, setFormData] = useState<Partial<CaseStudy>>({
        title: '',
        slug: '',
        industry: '',
        summary: '',
        challenge: '',
        solution: '',
        outcome: '',
        process: [],
        featured: false,
        published: false,
        images: []
    })

    const [isUploading, setIsUploading] = useState(false)
    const supabase = createClient()

    const [isAutoSlug, setIsAutoSlug] = useState(!initialData?.slug)

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                process: Array.isArray(initialData.process) ? initialData.process : [],
                images: Array.isArray(initialData.images) ? initialData.images : []
            })
            setIsAutoSlug(false)
        }
    }, [initialData])

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')   // Remove all non-word chars
            .replace(/--+/g, '-')      // Replace multiple - with single -
            .replace(/^-+/, '')        // Trim - from start of text
            .replace(/-+$/, '')        // Trim - from end of text
    }

    const handleChange = (field: keyof CaseStudy, value: string | string[] | boolean) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }
            
            // Auto-slugify if title changed and auto-slug is enabled
            if (field === 'title' && isAutoSlug && typeof value === 'string') {
                newData.slug = slugify(value)
            }
            
            return newData
        })
    }

    const handleSlugChange = (value: string) => {
        setIsAutoSlug(false)
        handleChange('slug', value)
    }

    const handleProcessChange = (index: number, value: string) => {
        const newProcess = [...(formData.process || [])]
        newProcess[index] = value
        handleChange('process', newProcess)
    }

    const addProcessStep = () => {
        handleChange('process', [...(formData.process || []), ''])
    }

    const removeProcessStep = (index: number) => {
        const newProcess = (formData.process || []).filter((_, i) => i !== index)
        handleChange('process', newProcess)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            const newImages = [...(formData.images || [])]

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const filePath = `case-studies/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('case-studies')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('case-studies')
                    .getPublicUrl(filePath)

                newImages.push(publicUrl)
            }

            handleChange('images', newImages)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert('Error uploading image: ' + message)
        } finally {
            setIsUploading(false)
        }
    }

    const removeImage = (url: string) => {
        handleChange('images', (formData.images || []).filter(img => img !== url))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    return (
        <div className="editor-overlay">
            <div className="editor-modal">
                <div className="editor-header">
                    <h2>{initialData ? 'Edit Case Study' : 'New Case Study'}</h2>
                    <button onClick={onCancel} className="close-btn">×</button>
                </div>

                <form onSubmit={handleSave} className="editor-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                value={formData.title || ''}
                                onChange={e => handleChange('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug (URL)</label>
                            <input
                                value={formData.slug || ''}
                                onChange={e => handleSlugChange(e.target.value)}
                                placeholder="project-name-slug"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Industry</label>
                            <input
                                value={formData.industry || ''}
                                onChange={e => handleChange('industry', e.target.value)}
                                placeholder="e.g. Fintech"
                            />
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Summary (Homepage Card)</label>
                        <textarea
                            value={formData.summary || ''}
                            onChange={e => handleChange('summary', e.target.value)}
                            rows={2}
                            placeholder="Brief catchy summary for the homepage card"
                        />
                    </div>

                    <div className="form-group full">
                        <label>The Challenge</label>
                        <textarea
                            value={formData.challenge || ''}
                            onChange={e => handleChange('challenge', e.target.value)}
                            rows={3}
                            placeholder="What problem were we trying to solve?"
                        />
                    </div>

                    <div className="form-group full">
                        <label>The Solution</label>
                        <textarea
                            value={formData.solution || ''}
                            onChange={e => handleChange('solution', e.target.value)}
                            rows={3}
                            placeholder="How did we solve it?"
                        />
                    </div>

                    <div className="form-group full">
                        <label>Process (Steps)</label>
                        <div className="steps-list">
                            {(formData.process || []).map((step, index) => (
                                <div key={index} className="step-item">
                                    <span className="step-num">{index + 1}</span>
                                    <input
                                        value={step}
                                        onChange={e => handleProcessChange(index, e.target.value)}
                                        placeholder="e.g. User Research or Technical Strategy"
                                    />
                                    <button type="button" onClick={() => removeProcessStep(index)} className="remove-step">×</button>
                                </div>
                            ))}
                            <button type="button" onClick={addProcessStep} className="add-step-btn">+ Add Step</button>
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Outcome & Results</label>
                        <textarea
                            value={formData.outcome || ''}
                            onChange={e => handleChange('outcome', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="form-group full">
                        <label>Showcase Images</label>
                        <div className="image-uploader">
                            <div className="image-grid">
                                {(formData.images || []).map((url, idx) => (
                                    <div key={idx} className="image-preview">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt={`Project ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => removeImage(url)} className="delete-img">×</button>
                                    </div>
                                ))}
                                <label className="upload-box">
                                    {isUploading ? '...' : '+'}
                                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} hidden />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="toggle-row">
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={formData.featured || false}
                                onChange={e => handleChange('featured', e.target.checked)}
                            />
                            Featured Project
                        </label>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={formData.published || false}
                                onChange={e => handleChange('published', e.target.checked)}
                            />
                            Published
                        </label>
                    </div>

                    <div className="editor-actions">
                        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn" disabled={isUploading}>Save Project</button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .editor-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .editor-modal {
          background: #fff;
          width: 95%; max-width: 900px;
          height: 90vh;
          border-radius: 12px;
          display: flex; flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }

        .editor-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          display: flex; justify-content: space-between; align-items: center;
        }
        .editor-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
        .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }

        .editor-form { padding: 24px; overflow-y: auto; flex: 1; }
        
        .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group.full { width: 100%; }
        
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
        .form-group input, .form-group textarea {
          width: 100%; padding: 10px; border: 1px solid #eee; border-radius: 8px;
          font-size: 14px; background: #fafafa;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #000; outline: none; background: #fff; }

        .steps-list { display: flex; flex-direction: column; gap: 8px; }
        .step-item { display: flex; align-items: center; gap: 10px; }
        .step-num { 
          width: 24px; height: 24px; background: #eee; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
        }
        .remove-step { background: none; border: none; font-size: 18px; color: #ff4d4f; cursor: pointer; }
        .add-step-btn { 
          align-self: flex-start; padding: 6px 12px; background: #f0f0f0; border: none; 
          border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 4px;
        }

        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; }
        .image-preview { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        .delete-img { 
          position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: #fff; 
          border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;
        }
        .upload-box { 
          aspect-ratio: 1; border: 2px dashed #eee; border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; color: #ccc;
        }
        .upload-box:hover { border-color: #ddd; color: #999; }

        .toggle-row { display: flex; gap: 24px; margin: 20px 0; padding: 16px; background: #f9f9f9; border-radius: 8px; }
        .toggle { display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; font-size: 13px; }

        .editor-actions {
          padding-top: 20px; border-top: 1px solid #eee;
          display: flex; justify-content: flex-end; gap: 12px;
        }

        .cancel-btn { padding: 10px 20px; background: transparent; border: 1px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
        .save-btn { padding: 10px 24px; background: #111; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
        </div>
    )
}
