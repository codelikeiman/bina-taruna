import { useEffect, useState } from 'react'
import { fetchPpdbMajors, fetchPpdbSettings } from '../lib/ppdbApi'

export function usePpdbConfig() {
  const [state, setState] = useState({ settings: null, majors: [], isLoading: true, error: null })

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchPpdbSettings(), fetchPpdbMajors()])
      .then(([settings, majors]) => {
        if (cancelled) return
        setState({ settings, majors, isLoading: false, error: null })
      })
      .catch((error) => {
        if (cancelled) return
        setState({ settings: null, majors: [], isLoading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
