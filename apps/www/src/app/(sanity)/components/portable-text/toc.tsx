import { legacySlugify } from '@/app/(sanity)/components/portable-text/helpers/legacy-slugify'
import { Sub, Sup } from '@/app/(sanity)/components/portable-text/marks'
import type { PortableTextContentFragmentType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { css } from '@republik/theme/css'
import {
  PortableText,
  toPlainText,
  type PortableTextBlock,
  type PortableTextReactComponents,
} from 'next-sanity'

type TocType = Extract<
  PortableTextContentFragmentType['content'][number],
  { _type: 'toc' }
>

const tocInlineComponents: Partial<PortableTextReactComponents> = {
  types: {},

  block: {
    // unwrap the heading style
    heading: ({ children }) => <>{children}</>,
  },
  marks: {
    sub: Sub,
    sup: Sup,
  },
}

export function Toc({ value }: { value: TocType }) {
  return (
    <>
      <h3 className={css({ fontWeight: 'bold' })}>
        {value.title ?? 'Inhaltsverzeichnis'}
      </h3>
      <ul>
        {value.headings?.map((heading) => {
          const plainText = toPlainText(heading as PortableTextBlock)
          const id = legacySlugify(plainText)
          return (
            <li key={heading._key}>
              <a
                className={css({ textDecoration: 'underline' })}
                href={`#${id}`}
              >
                <PortableText
                  components={tocInlineComponents}
                  value={heading}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </>
  )
}
