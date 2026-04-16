import { Dispatch, SetStateAction, useEffect, useState } from 'react'

// Check if the website is running in a secure document.
function isInSecureWindow(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
}

// ---- Apple Pay ----

// Declare ApplePaySession property to prevent TypeScript errors
declare global {
  interface Window {
    ApplePaySession: ApplePaySession | undefined
  }
}

function isApplePayAvailable(): boolean {
  if (!isInSecureWindow() || !window.ApplePaySession) {
    return false
  }
  return ApplePaySession.canMakePayments()
}

export function useIsApplePayAvailable(): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
] {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    // Only check for Apple Pay on the client and when a secure connection is provided
    setIsAvailable(isApplePayAvailable())
  }, [])

  return [isAvailable, setIsAvailable]
}

// ---- Google Pay ----

function isGooglePayAvailable(): boolean {
  if (!isInSecureWindow()) {
    return false
  }

  const isAndroid = /Android/.test(navigator.userAgent)
  const isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

  return isAndroid && isChrome
}

export function useIsGooglePayAvailable(): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
] {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    // Only check for Google Pay on the client and when a secure connection is provided
    setIsAvailable(isGooglePayAvailable())
  }, [])

  return [isAvailable, setIsAvailable]
}
