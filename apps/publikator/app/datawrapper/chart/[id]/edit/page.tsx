import { meHasRole } from 'lib/graphql/me-has-role'
import { notFound, redirect } from 'next/navigation'

async function fetchLoginUrl(chartId: string) {
  const isEditor = await meHasRole('editor')

  if (!isEditor) {
    return undefined
  }

  const res = await fetch(`https://api.datawrapper.de/v3/auth/login-tokens`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.DATAWRAPPER_API_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      chartId,
    }),
  })

  if (!res.ok) {
    return undefined
  }
  return res.json()
}

export default async function Login({
  params: { id },
}: {
  params: { id: string }
}) {
  const loginUrl = await fetchLoginUrl(id)

  if (loginUrl) {
    redirect(loginUrl.redirect_url)
  } else {
    notFound()
  }
}
