import { useEffect, useState } from 'react'

// Check if the website is running in a secure document.
function isInSecureDocument(): boolean {
  return (
    typeof window !== 'undefined' && window.location.protocol === 'https:'
  )
}

// Declare ApplePaySession property to prevent TypeScript errors
declare global {
  interface Window {
    ApplePaySession: ApplePaySession | undefined
  }
}

function isApplePayAvailable(): boolean {
  if (!window?.ApplePaySession) {
    return false
  }
  return ApplePaySession.canMakePayments()
}

export function useIsApplePayAvailable(): boolean {
  const checkIfApplePayAvailable = () =>
    isInSecureDocument() && isApplePayAvailable()
  const [isAvailable, setIsAvailable] = useState(checkIfApplePayAvailable())

  useEffect(() => {
    try {
      // Only check for Apple Pay on the client and when a secure connection is provided
      setIsAvailable(checkIfApplePayAvailable())
    } catch (error) {
      console.error('Error checking for Apple Pay availability', error)
    }
  }, [])

  return isAvailable
}
