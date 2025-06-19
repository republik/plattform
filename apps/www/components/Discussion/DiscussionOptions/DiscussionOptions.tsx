import { css } from 'glamor'
import { A, pxToRem, Scroller, TabButton } from '@project-r/styleguide'
import { useDiscussion } from '../context/DiscussionContext'
import { getFocusHref, getFocusUrl } from '../shared/CommentLink'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { rerouteDiscussion } from '../shared/DiscussionLink'
import { useTranslation } from '../../../lib/withT'

const styles = {
  reloadLink: css({
    display: 'flex',
    flexDirection: 'row-reverse',
    lineHeight: pxToRem('25px'),
    fontSize: pxToRem('16px'),
  }),
}

type Props = {
  documentMeta?: any
}

const DiscussionOptions = ({ documentMeta }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { discussion, refetch, orderBy } = useDiscussion()
  const resolvedOrderBy = discussion?.comments?.resolvedOrderBy
  const discussionType = documentMeta?.discussionType

  const availableOrderBy = useMemo(() => {
    let items: string[]

    if (discussionType === 'statements') {
      items = ['DATE', 'VOTES']
    } else {
      items = ['DATE', 'VOTES', 'REPLIES']
    }

    return items
  }, [discussionType])

  const handleReload = async (e) => {
    e.preventDefault()
    const href = getFocusHref(discussion)
    if (href) {
      await router.replace(href)
      await refetch({
        focusId: undefined,
      })
    } else {
      await refetch()
    }
  }

  return (
    <div>
      <Scroller>
        {availableOrderBy.map((item) => {
          return (
            <Link
              href={rerouteDiscussion(router, {
                order: item,
              })}
              scroll={false}
              prefetch={false}
              passHref
              key={item}
              legacyBehavior
            >
              <TabButton
                border={false}
                text={t(`components/Discussion/OrderBy/${item}`)}
                isActive={item === (resolvedOrderBy ?? orderBy)}
              />
            </Link>
          )
        })}
      </Scroller>
      {handleReload && (
        <div>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <A
            {...styles.reloadLink}
            href={getFocusUrl(discussion)}
            onClick={handleReload}
          >
            {t('components/Discussion/reload')}
          </A>
        </div>
      )}
    </div>
  )
}

export default DiscussionOptions
