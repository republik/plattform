import React from 'react'
import Link from '../Link/Href'
import { inQuotes, A } from '@project-r/styleguide'
import { useDiscussion } from '../Discussion/context/DiscussionContext'
import { useTranslation } from '../../lib/withT'

const AutoDiscussionTitle = () => {
  const { discussion } = useDiscussion()
  const { t } = useTranslation()

  const documentMeta = discussion?.document?.meta
  if (!documentMeta) {
    return null
  }

  return (
    <>
      {t.elements('feedback/autoArticle/selected/headline', {
        link: (
          <Link key='link' href={documentMeta.path} passHref>
            <A href={documentMeta.path}>{inQuotes(documentMeta.title || '')}</A>
          </Link>
        ),
      })}
    </>
  )
}

export default AutoDiscussionTitle
