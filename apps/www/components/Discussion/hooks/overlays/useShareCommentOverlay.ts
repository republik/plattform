import useOverlay, { OverlayState } from './useOverlay'
import { CommentFragmentType } from '../../graphql/fragments/CommentFragment.graphql'
import { postMessage, useInNativeApp } from '../../../../lib/withInNativeApp'
import { getFocusUrl } from '../../shared/CommentLink'
import { useTranslation } from '../../../../lib/withT'
import { DiscussionFragmentType } from '../../graphql/fragments/DiscussionFragment.graphql'

type ShareHandlerFunction = (comment: CommentFragmentType) => Promise<unknown>

export type ShareOverlayState = OverlayState<string> & {
  shareHandler: ShareHandlerFunction
}

/**
 * Provide the share overlay state and comment share-handler
 */
function useShareCommentOverlay(
  discussion: DiscussionFragmentType | undefined,
): ShareOverlayState {
  const { t } = useTranslation()
  const { inNativeApp } = useInNativeApp()
  const overlay = useOverlay<string>()

  function shareHandler(comment: CommentFragmentType): Promise<unknown> {
    if (!discussion) {
      return Promise.reject(new Error('No discussion loaded'))
    }

    if (inNativeApp) {
      postMessage({
        type: 'share',
        payload: {
          title: discussion.title,
          url: getFocusUrl(discussion, comment),
          subject: t(
            'discussion/share/emailSubject',
            {
              title: discussion.title,
            },
            '',
          ),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dialogTitle: t('article/share/title'),
        },
      })
    } else {
      overlay.handleOpen(getFocusUrl(discussion, comment))
    }
    return Promise.resolve({ ok: true })
  }

  return {
    ...overlay,
    shareHandler,
  }
}

export default useShareCommentOverlay
