import { redirect } from 'next/navigation'

/**
 * [Page] searchParams returns a plain JavaScript object and not a URLSearchParams instance.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
 */
type PageProps = {
  params: { _slugs?: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}

/**
 * Applies searchParams to URL.searchParams
 *
 */
const applySearchParams = (
  url: URL,
  searchParams: PageProps['searchParams'],
) => {
  Object.keys(searchParams)
    .filter((key) => key !== '_slugs')
    .forEach((key) => {
      const value = searchParams[key]

      if (Array.isArray(value)) {
        value.forEach((valuevalue) => {
          url.searchParams.append(key, valuevalue)
        })
      } else {
        url.searchParams.append(key, value)
      }
    })
}

export default function Page({ params, searchParams }: PageProps) {
  if (!process.env.FRONTEND_BASE_URL) {
    throw new Error('FRONTEND_BASE_URL not set')
  }

  // Parse a fully qualified URL from params.path elements, using FRONTEND_BASE_URL
  const url = new URL(
    params._slugs?.join('/') || '/',
    process.env.FRONTEND_BASE_URL,
  )

  // Ensure, FRONTEND_BASE_URL protocol and hostname are set
  const baseUrl = new URL(process.env.FRONTEND_BASE_URL)
  if (url.hostname !== baseUrl.hostname) {
    url.hostname = baseUrl.hostname
  }
  if (url.protocol !== url.protocol) {
    url.protocol = baseUrl.protocol
  }

  // Apply searchParams to url
  applySearchParams(url, searchParams)

  // Haha, there is not page! Just a redirect.
  redirect(url.toString())
}
