import {
  CommentTeaser,
  Loader,
  mediaQueries,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from '@project-r/styleguide'
import { css } from 'glamor'

import { screenshotUrl } from '@app/lib/util/screenshot-api'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { useTranslation } from '../../lib/withT'
import CommentLink from '../Discussion/shared/CommentLink'
import SectionContainer from './Common/SectionContainer'
import SectionTitle from './Common/SectionTitle'

const Community = ({ loading, error, featuredComments }) => {
  const { t } = useTranslation()
  return (
    <SectionContainer>
      <SectionTitle
        title={t('marketing/page/community/title')}
        lead={t('marketing/page/community/lead')}
      />
      <Loader
        loading={loading}
        error={error}
        style={{ minHeight: 400 }}
        render={() => (
          <div {...styles.row}>
            {featuredComments.nodes.map((comment) => {
              const image =
                comment.discussion?.document?.meta?.image ||
                (comment.discussion?.document?.meta?.shareText
                  ? screenshotUrl({
                      url: `${PUBLIC_BASE_URL}${comment.discussion.document.meta.path}?extract=share`,
                      width: SHARE_IMAGE_WIDTH,
                      height: SHARE_IMAGE_HEIGHT,
                      version: `${comment.discussion.document.id}${
                        comment.discussion.document.meta.format
                          ? `-${comment.discussion.document.meta.format.id}`
                          : ''
                      }`,
                    })
                  : undefined)

              return (
                <div {...styles.comment} key={comment.id}>
                  <CommentTeaser
                    {...{
                      ...comment,
                      discussion: {
                        ...comment.discussion,
                        image,
                      },
                    }}
                    CommentLink={CommentLink}
                    t={t}
                  />
                </div>
              )
            })}
          </div>
        )}
      />
    </SectionContainer>
  )
}

const styles = {
  row: css({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1280,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }),
  comment: css({
    margin: '0 auto',
    width: '100%',
    maxWidth: 500,
    padding: 0,
    [mediaQueries.mUp]: {
      width: '50%',
      padding: '0 15px',
    },
  }),
}

export default Community
