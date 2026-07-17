import { SERIES_NAV_QUERY } from '@/app/(sanity)/groq/series-nav-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { headers } from 'next/headers'

export async function SeriesMenu() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const slug = pathname.split('/').filter(Boolean).pop() ?? ''

  const { data } = await sanityFetch({
    query: SERIES_NAV_QUERY,
    params: { slug },
  })

  console.log(data)

  return (
    <div
      className={css({
        position: 'absolute',
        background: 'background',
        top: 1,
        left: 0,
        right: 0,
        bottom: 0,
      })}
    >
      HELLO
    </div>
  )
}
