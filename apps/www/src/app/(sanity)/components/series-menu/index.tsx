import { SERIES_MENU_QUERY } from '@/app/(sanity)/groq/series-menu-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { SeriesMenuBar } from './series-menu-bar'

// Expandable series navigation at the top of an article that belongs to a
// series (modelled after components/Article/SeriesNavBar.js).
export async function SeriesMenu({ slug }: { slug: string }) {
  const { data } = await sanityFetch({
    query: SERIES_MENU_QUERY,
    params: { slug },
  })

  const collection = data?.articleCollection
  if (!collection?.series || !collection.episodes?.length) return null

  return <SeriesMenuBar collection={collection} currentSlug={slug} />
}
