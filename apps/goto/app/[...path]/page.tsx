/**
 * [Page] searchParams returns a plain JavaScript object and not a URLSearchParams instance.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
 */
type PageSearchParams = { [key: string]: string | string[] | undefined }
/**
 * Applies searchParams to URL.searchParams
 *
 */
const applySearchParams = (url: URL, searchParams: PageSearchParams) => {
  Object.keys(searchParams).forEach((key) => {
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

export default function Page({
  params,
  searchParams,
}: {
  params: { path: string[] }
  searchParams: PageSearchParams
}) {
  const url = new URL(
    params.path.join('/'),
    process.env.FRONTEND_BASE_URL || 'http://localhost:3010',
  )

  applySearchParams(url, searchParams)

  return (
    <>
      <h1>Hi there!</h1>
      <p>Would forward you to {url.toString()}</p>
    </>
  )
}
