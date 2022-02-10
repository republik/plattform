/**
 * Check if the browser has Apple Pay support
 */
export const isApplePayAvailable = async () => {
  if (!ApplePaySession) {
    return false
  }
  const merchantIdentifier = 'example.com.store' // TODO: get from env
  const canMakePayments = await ApplePaySession.canMakePaymentsWithActiveCard(
    merchantIdentifier,
  ).catch(() => false)
  return canMakePayments
}
