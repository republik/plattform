import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { css } from '@republik/theme/css'

export const getAuthors = (document: Document) =>
  'Von ' +
  document.meta.contributors
    .filter((contributor) => contributor.kind.includes('Text'))
    .map((contributor) => contributor.name)
    .join(', ')

export function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  // set fomat color as text color
  return <h5 className={css({ color: 'red' })}>{text}</h5>
}
