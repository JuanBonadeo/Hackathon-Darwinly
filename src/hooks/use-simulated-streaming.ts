import { useEffect, useRef, useState } from 'react'

export function useSimulatedStreaming(
  text: string | undefined,
  enabled: boolean,
  charsPerTick = 15,
  tickMs = 120,
) {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text ?? '')
      setIsStreaming(false)
      return
    }

    indexRef.current = 0
    setDisplayedText('')
    setIsStreaming(true)

    const interval = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + charsPerTick, text.length)
      setDisplayedText(text.slice(0, indexRef.current))

      if (indexRef.current >= text.length) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, tickMs)

    return () => clearInterval(interval)
  }, [text, enabled, charsPerTick, tickMs])

  return { displayedText, isStreaming }
}
