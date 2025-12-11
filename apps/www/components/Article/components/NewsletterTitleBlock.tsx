import Link from 'next/link'

import {
  colors,
  plainLinkRule,
  Interaction,
  TitleBlock,
  Editorial,
} from '@project-r/styleguide'

import { formatDate } from '../../../lib/utils/format'

const NewsletterTitle = ({ meta }) => {
  const format = meta.format
  const template = meta?.template
  const isEditorialNewsletter = template === 'editorialNewsletter'

  if (!isEditorialNewsletter) return null

  return (
    <TitleBlock margin={false} breakout={false}>
      {format && format.meta && (
        <Editorial.Format color={format.meta.color || colors[format.meta.kind]}>
          <Link href={format.meta.path} passHref {...plainLinkRule}>
            {format.meta.title}
          </Link>
        </Editorial.Format>
      )}
      <Interaction.Headline>{meta.title}</Interaction.Headline>
      <Editorial.Credit>
        {formatDate(new Date(meta.publishDate))}
      </Editorial.Credit>
    </TitleBlock>
  )
}

export default NewsletterTitle
