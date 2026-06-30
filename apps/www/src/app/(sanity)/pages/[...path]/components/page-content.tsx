import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery } from 'next-sanity'

const PAGE_CONTENT_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id,
    pageBuilder[]{
      ...,
    }
  }`,
)

export async function PageContent({ slug }: { slug: string }) {
  const { data: page } = await sanityFetch({
    query: PAGE_CONTENT_QUERY,
    params: { slug },
  })

  console.log('page', page.pageBuilder)

  // TODO: render structure
  return <p>Hello World!</p>
}
