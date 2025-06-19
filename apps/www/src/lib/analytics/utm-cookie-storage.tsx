'use client'

import { PUBLIC_BASE_URL } from 'lib/constants'
const CONVERSION_COOKIE_NAME = 'republik-utm-conversion'
const COOKIE_EXPIRY_DAYS = 30

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  const baseDomain = new URL(PUBLIC_BASE_URL).hostname
    .split('.')
    .slice(-2)
    .join('.')

  let cookieString = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires.toUTCString()}; path=/`

  cookieString += `; domain=.${baseDomain}`
  cookieString += '; SameSite=Lax'

  document.cookie = cookieString
}

function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

function getUTMParametersFromURL(): Record<string, string> {
  const utmParams: Record<string, string> = {}

  try {
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      if (key.startsWith('utm_')) {
        utmParams[key] = value
      }
    }
  } catch {
    // ignore
  }

  return utmParams
}

export function updateUTMConversionCookie(): void {
  const currentUTMParams = getUTMParametersFromURL()

  if (Object.keys(currentUTMParams).length === 0) {
    return
  }

  // Check if cookie already exists
  const existingCookieValue = getCookie(CONVERSION_COOKIE_NAME)
  let shouldUpdateCookie = true

  if (existingCookieValue) {
    const existingData = JSON.parse(existingCookieValue)
    const cookieTimestamp = existingData.timestamp

    const cookieAge = Date.now() - cookieTimestamp
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

    // Don't update if cookie is less than 30 days old
    if (cookieAge < thirtyDaysInMs) {
      shouldUpdateCookie = false
    }
  }

  if (shouldUpdateCookie) {
    const cookieData = {
      ...currentUTMParams,
      timestamp: Date.now(),
    }

    setCookie(
      CONVERSION_COOKIE_NAME,
      JSON.stringify(cookieData),
      COOKIE_EXPIRY_DAYS,
    )
  }
}

export function getUTMConversionCookie(): Record<string, string> {
  const cookieValue = getCookie(CONVERSION_COOKIE_NAME)
  if (cookieValue) {
    const cookieData = JSON.parse(cookieValue)
    const { timestamp, ...utmParams } = cookieData
    return utmParams
  }

  return {}
}