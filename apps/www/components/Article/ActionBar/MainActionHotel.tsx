import { css } from 'glamor'
import {
  useColorContext,
  plainButtonRule,
  plainLinkRule,
} from '@project-r/styleguide'
import { useMe } from '../../../lib/context/MeContext'
import {
  IconBookmarkBorder,
  IconDiscussion,
  IconNews,
  IconShare,
} from '@republik/icons'
import Link from 'next/link'
import { useMemo } from 'react'
import { getDiscussionLinkProps } from '../../ActionBar/utils'
import { PUBLIC_BASE_URL } from '../../../lib/constants'

type MainActionHotelProps = {
  document: any
}

function MainActionHotel({ document }: MainActionHotelProps) {
  const { meLoading } = useMe()
  const [colorScheme] = useColorContext()

  const discussionLink = useMemo(() => {
    const meta = document?.meta
    if (!meta) {
      return null
    }
    const {
      discussionId,
      discussionPath,
      discussionQuery,
      discussionCount,
      isDiscussionPage,
    } = getDiscussionLinkProps(
      meta.linkedDiscussion,
      meta.ownDiscussion,
      meta.template,
      meta.path,
    )

    const url = new URL(discussionPath, PUBLIC_BASE_URL)
    url.search = discussionQuery.toString()
    return url.toString()
  }, [document])

  return (
    <div {...styles.root}>
      <div {...styles.actions}>weiterlesen mark as read</div>
      <div {...styles.actions}>
        <button {...plainButtonRule} {...styles.action}>
          <IconNews size={24} />
          PDF
        </button>
        <button {...plainButtonRule} {...styles.action}>
          <IconBookmarkBorder size={24} />
          Merken
        </button>
        <button {...plainButtonRule} {...styles.action}>
          <IconShare size={24} />
          Teilen
        </button>
        <Link href={}>
          <a
            {...plainLinkRule}
            {...styles.action}
            {...colorScheme.set('color', 'primary')}
          >
            <IconDiscussion size={24} />
            {document?.meta?.ownDiscussion?.comments?.totalCount || ''}
          </a>
        </Link>
      </div>
      <pre>
        {JSON.stringify(
          {
            meLoading,
            document: document.meta,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

export default MainActionHotel

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '0.75rem',
    '& > div': {
      border: '1px solid rgba(0, 0, 0, 0.1)',
    },
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1rem',
  }),
  action: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.5rem',
  }),
}
