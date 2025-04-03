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

export const reloadPage = () => {
  setTimeout(() => {
    window.location.reload()
  }, 200)
}
