export type SignupContextType = 'trial' | 'signIn'

export const reloadPage = (
  context?: SignupContextType,
  redirectUrl?: string,
) => {
  if (redirectUrl) {
    return window.location.replace(redirectUrl)
  }
  if (context === 'trial') {
    const url = new URL(window.location.href)
    // when this query param is present, we don't show the expanded paynote
    url.searchParams.set('trialSignup', 'true')
    return window.location.replace(url.toString())
  }
  window.location.reload()
}
