import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useInNativeApp } from '../../../lib/withInNativeApp'

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
    // Only check for Apple Pay on the client and when a secure connection is provided
    setIsAvailable(isInSecureWindow() && isApplePayAvailable())
  }, [])

  return [isAvailable, setIsAvailable]
}

// ---- Google Pay ----

function isGooglePayAvailable(inNativeApp?: boolean): boolean {
  if (!isInSecureWindow()) {
    return false
  }

  const isAndroid = /Android/.test(navigator.userAgent)
  const isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

  return isAndroid && (isChrome || inNativeApp)
}

export function useIsGooglePayAvailable(): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
] {
  const { isInNativeApp } = useInNativeApp()
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    // Only check for Google Pay on the client and when a secure connection is provided
    setIsAvailable(isInSecureWindow() && isGooglePayAvailable(isInNativeApp))
  }, [isInNativeApp])

  return [isAvailable, setIsAvailable]
}
