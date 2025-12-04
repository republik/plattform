import {
  Editorial,
  Interaction,
  timeahead,
  useCurrentMinute,
} from '@project-r/styleguide'
import Link from 'next/link'
import { ReactElement, ReactNode } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'
import Box from '../../Frame/Box'
import { useDiscussion } from '../context/DiscussionContext'

type Props = {
  children: ReactNode
  isRoot?: boolean
  isEditing?: boolean
  showPayNotes?: boolean
}

/**
 * Handle rendering of a DiscussionComposer
 * @param children
 * @param isRoot
 * @param isEditing
 * @param showPayNotes
 * @constructor
 */
const DiscussionComposerBarrier = ({
  children,
  isRoot,
  isEditing = false,
  showPayNotes,
}: Props): ReactElement => {
  const { inNativeApp } = useInNativeApp()
  const { discussion } = useDiscussion()
  const { hasActiveMembership } = useMe()
  const { t } = useTranslation()

  const now = useCurrentMinute()

  function timeAheadFromNow(dateString) {
    return timeahead(t, (now - Date.parse(dateString)) / 1000)
  }

  const isHiddenTopLevelComposer =
    isRoot && !!discussion?.rules?.disableTopLevelComments
  const hidePayNote = !showPayNotes || inNativeApp

  if (!discussion || isHiddenTopLevelComposer) {
    return null
  }

  if (discussion.closed) {
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    return <Box style={{ padding: '15px 20px' }}>{t('discussion/closed')}</Box>
  }

  // In case the user can't comment on the discussion, e.g. not signed in or no membership
  if (!isEditing && !discussion?.userCanComment) {
    if (hidePayNote || hasActiveMembership) {
      return null
    }

    return (
      <Box style={{ padding: '15px 20px' }}>
        <Interaction.P>
          {t.elements(
            'submitComment/notEligible',
            {
              pledgeLink: (
                <Link href='/angebote' key='pledge' passHref legacyBehavior>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  <Editorial.A>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    {t('submitComment/notEligible/pledgeText')}
                  </Editorial.A>
                </Link>
              ),
            },
            '',
          )}
        </Interaction.P>
      </Box>
    )
  }

  const waitUntilDate =
    discussion.userWaitUntil && new Date(discussion.userWaitUntil)
  if (waitUntilDate && waitUntilDate > new Date()) {
    return (
      <Box style={{ padding: '15px 20px' }}>
        <Interaction.P>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          {t('styleguide/CommentComposer/wait', {
            time: timeAheadFromNow(waitUntilDate),
          })}
        </Interaction.P>
      </Box>
    )
  }

  return <>{children}</>
}

export default DiscussionComposerBarrier
