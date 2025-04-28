export type SignupContextType = 'trial'

export const reloadPage = (context?: SignupContextType) => {
  console.log('reloadPage', { context })
  if (context === 'trial') {
    const url = new URL(window.location.href)
    // when this query param is present, we don't show the expanded paynote
    url.searchParams.set('trialSignup', 'true')
    return window.location.replace(url.toString())
  }
  window.location.reload()
}
