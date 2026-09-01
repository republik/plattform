import { dataset, projectId, studioUrl } from '@/app/(sanity)/lib/env'
import type { ContentSourceMapParsedPath } from '@sanity/client/stega'
import { createClient } from 'next-sanity'

// Never stega-encode these source fields
const STEGA_SKIP_FIELDS: ContentSourceMapParsedPath = [
  'size',
  'figureSize',
  'layout',
  'imagePosition',
  'identifier',
  'textSize',
  'textPosition',
  'textAlignment',
  'syntheticVoice',
  'syntheticVoice2',
  'readingAccess',
  'discussionAnonymity',
  'sourceType',
  'appearance',
  'code',
  'name',
]

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-02-01',
  useCdn: true,
  stega: {
    studioUrl,
    filter: (props) => {
      const fieldName = props.sourcePath.at(-1)

      if (STEGA_SKIP_FIELDS.includes(fieldName)) {
        return false
      }

      return props.filterDefault(props)
    },
  },
})
