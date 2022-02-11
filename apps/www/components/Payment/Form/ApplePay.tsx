import { useEffect, useState } from 'react'

// Check if the website is running in a secure document.
function isInSecureDocument(): boolean {
  return (
    typeof window !== 'undefined' && window?.location?.protocol === 'https:'
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

export const useIsApplePayAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(
    isInSecureDocument() && isApplePayAvailable(),
  )

  useEffect(() => {
    try {
      // Only check for Apple Pay on the client and when a secure connection is provided
      setIsAvailable(isInSecureDocument() && isApplePayAvailable())
    } catch (error) {
      console.error('Error checking for Apple Pay availability', error)
    }
  }, [])

  return isAvailable
}
