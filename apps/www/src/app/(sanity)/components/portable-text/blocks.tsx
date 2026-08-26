import { legacySlugify } from '@/app/(sanity)/components/portable-text/helpers/legacy-slugify'
import { toPlainText, type PortableTextBlockComponent } from 'next-sanity'

export const Heading: PortableTextBlockComponent = ({ children, value }) => {
  const plainText = toPlainText(value)
  const id = legacySlugify(plainText)

  return <h2 id={id}>{children}</h2>
}
