import Link from '../Link/Href'
import { inQuotes, A } from '@project-r/styleguide'
import { useDiscussion } from '../Discussion/context/DiscussionContext'
import { useTranslation } from '@/lib/withT'

const AutoDiscussionTitle = () => {
  const { discussion } = useDiscussion()
  const { t } = useTranslation()

  if (!discussion) {
    return null
  }

  return (
    <>
      {t.elements('feedback/autoArticle/selected/headline', {
        link: (
          <Link key='link' href={discussion.path} passHref>
            <A href={discussion.path}>{inQuotes(discussion.title || '')}</A>
          </Link>
        ),
      })}
    </>
  )
}

export default AutoDiscussionTitle
