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
  if (!window.ApplePaySession) {
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
    try {
      // Only check for Apple Pay on the client and when a secure connection is provided
      setIsAvailable(isInSecureWindow() && isApplePayAvailable())
    } catch (error) {
      console.error('Error checking for Apple Pay availability', error)
    }
  }, [])

  return [isAvailable, setIsAvailable]
}

// ---- Google Pay ----

function isGooglePayAvailable(): boolean {
  if (!isInSecureWindow()) {
    return false
  }
  const isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  const isAndroid = /Android/.test(navigator.userAgent)

  return isChrome || isAndroid
}

export function useIsGooglePayAvailable(): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
] {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    try {
      // Only check for Google Pay on the client and when a secure connection is provided
      //setIsAvailable(isInSecureWindow() && isGooglePayAvailable())
      setIsAvailable(true)
    } catch (error) {
      console.error('Error checking for Google Pay availability', error)
    }
  }, [])

  return [isAvailable, setIsAvailable]
}
