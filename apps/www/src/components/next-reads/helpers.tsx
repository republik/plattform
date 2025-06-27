import { Document } from '#graphql/republik-api/__generated__/gql/graphql'

export const getAuthors = (
  contributors: Array<{ kind?: string; name: string }> = [],
) =>
  'Von ' +
  contributors
    .filter((contributor) => contributor.kind?.includes('Text'))
    .map((contributor) => contributor.name)
    .join(', ')

export function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  return (
    <h5
      style={{
        color:
          document.meta.format?.meta.color ||
          document.meta.format?.meta.section?.meta.color,
      }}
    >
      {text}
    </h5>
  )
}
