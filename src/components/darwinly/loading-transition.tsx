'use client'

import { useEffect, useState } from 'react'

type LoadingState = 'first-time-no-cache' | 'first-time-with-cache' | 'cached-for-user'

interface LoadingTransitionProps {
  state: LoadingState
  isVisible: boolean
  onHidden?: () => void
}

const CONFIG = {
  'first-time-no-cache': {
    duration: 6500, // Long for API calls (6.5 seconds)
    label: 'Consulting sources...',
    description: 'Searching Wikipedia, Papers, Books, and more',
  },
  'first-time-with-cache': {
    duration: 3500, // Simulated wait
    label: 'Generating content...',
    description: 'Analyzing information',
  },
  'cached-for-user': {
    duration: 1000, // Quick  
    label: 'Loading...',
    description: 'Preparing results',
  },
}

export function LoadingTransition({ state, isVisible, onHidden }: LoadingTransitionProps) {
  const [shouldShow, setShouldShow] = useState(isVisible)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [minDurationPassed, setMinDurationPassed] = useState(false)
  const config = CONFIG[state]

  // Manage minimum duration before allowing hide
  useEffect(() => {
    if (isVisible) {
      setShouldShow(true)
      setStartedAt(Date.now())
      setMinDurationPassed(false)
      const minTimer = setTimeout(() => {
        setMinDurationPassed(true)
      }, config.duration)
      return () => clearTimeout(minTimer)
    }
  }, [isVisible, config.duration])

  // Hide only when loading is done AND minimum duration passed
  useEffect(() => {
    if (!isVisible && minDurationPassed) {
      setShouldShow(false)
      onHidden?.()
    }
  }, [isVisible, minDurationPassed, onHidden])

  useEffect(() => {
    if (!isVisible && shouldShow && startedAt !== null && !minDurationPassed) {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, config.duration - elapsed)
      const timer = setTimeout(() => {
        setMinDurationPassed(true)
      }, remaining)
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldShow, startedAt, minDurationPassed, config.duration])

  if (!shouldShow) {
    return null
  }

  return (
    <div className="search-transition-overlay">
      <div className="search-transition-backdrop" />
      <div className="search-transition-glow" />
      
      <div className="search-transition-content">
        <div className="search-transition-rings">
          {/* Ring animations */}
          <div
            className="search-transition-ring search-transition-ring-lg"
            style={{
              animationDuration: state === 'cached-for-user' ? '2.2s' : '3.2s',
            }}
          />
          <div
            className="search-transition-ring search-transition-ring-md"
            style={{
              animationDuration: state === 'cached-for-user' ? '1.7s' : '2.7s',
            }}
          />
          <div
            className="search-transition-ring search-transition-ring-sm"
            style={{
              animationDuration: state === 'cached-for-user' ? '1.2s' : '2.2s',
            }}
          />
          
          {/* Darwinly Icon Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="search-transition-core h-16! w-16! flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Darwinly logo"
                className="search-transition-logo h-11 w-11"
              />
            </div>
          </div>
        </div>

        {/* Loading Label */}
        <div className="search-transition-label p-3">
          <strong className="search-transition-label-title">{config.label}</strong>
          <div className="search-transition-label-subtitle">{config.description}</div>
          {state !== 'cached-for-user' && (
            <div className="search-transition-label-meta">Asking Charles Darwin...</div>
          )}
        </div>
      </div>
    </div>
  )
}
