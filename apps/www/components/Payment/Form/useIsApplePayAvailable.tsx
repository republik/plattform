import { Dispatch, SetStateAction, useEffect, useState } from 'react'

// Check if the website is running in a secure document.
function isInSecureWindow(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
}

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
  const checkIfApplePayAvailable = () =>
    isInSecureWindow() && isApplePayAvailable()
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    try {
      // Only check for Apple Pay on the client and when a secure connection is provided
      setIsAvailable(checkIfApplePayAvailable())
    } catch (error) {
      console.error('Error checking for Apple Pay availability', error)
    }
  }, [])

  return [isAvailable, setIsAvailable]
}
