'use client'

import { useEffect, useState, useRef } from 'react'

const stats = [
    { label: 'Years Experience', value: 5, suffix: '+' },
    { label: 'In-House Experts', value: 10, suffix: '+' },
    { label: 'Canadian & Global Businesses', value: 20, suffix: '+' },
    { label: 'Projects Delivered', value: 50, suffix: '+' },
]

function CountUp({ end, suffix }: { end: number; suffix: string }) {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLSpanElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (countRef.current) {
            observer.observe(countRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return

        let start = 0
        const duration = 2000
        const increment = end / (duration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setCount(end)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [isVisible, end])

    return (
        <span ref={countRef}>
            {count}{suffix}
        </span>
    )
}

export default function Stats() {
    return (
        <section className="stats section bg-white">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item text-center">
                            <div className="stat-value">
                                <CountUp end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .stats {
          border-top: 1px solid var(--color-border-light);
          border-bottom: 1px solid var(--color-border-light);
          background-color: var(--color-background-white);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-value {
          font-size: 56px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 48px;
          }
          
          .stat-value {
            font-size: 44px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
        </section>
    )
}
