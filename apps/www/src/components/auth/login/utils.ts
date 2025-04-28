import { NextRouter } from 'next/router'

export const addStatusParamToRouter =
  (router: NextRouter) => (status: string) =>
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, trialSignup: status },
      },
      router.asPath,
      { shallow: true },
    )

export type SignupContextType = 'trial'

export const reloadPage = (context?: SignupContextType) => {
  const url = new URL(window.location.href)
  if (context === 'trial') {
    // when this query param is present, we don't show the expanded paynote
    url.searchParams.set('trialSignup', 'true')
  }
  window.history.replaceState({}, '', url.toString())
  setTimeout(() => {
    window.location.reload()
  }, 200)
}
