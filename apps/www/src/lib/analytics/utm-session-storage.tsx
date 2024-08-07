'use client'
import { useEffect } from 'react'

const STORAGE_KEY = 'republik-utm'

function setUTMSessionStorage(): void {
  try {
    const params = getUTMSessionStorage()

    for (const [k, v] of new URLSearchParams(window.location.search)) {
      if (k.startsWith('utm_')) {
        params[k] = v
      }
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // ignore
  }
}

export function getUTMSessionStorage(): Record<string, string> {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    // ignore
  }
  return {}
}

export function SyncUTMToSessionStorage() {
  useEffect(() => {
    setUTMSessionStorage()
  }, [])

  return null
}
