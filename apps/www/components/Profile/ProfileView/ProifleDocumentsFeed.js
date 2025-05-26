import { TeaserFeed, Interaction } from '@project-r/styleguide'
import HrefLink from '../../Link/Href'
import ActionBar from '../../ActionBar'
import { useTranslation } from '../../../lib/withT'
import InfiniteScroll from '../../Frame/InfiniteScroll'
import { css, merge } from 'glamor'

const styles = {
  loadMore: css({
    marginTop: -30,
    marginBottom: 40,
  }),
  noBorder: css({
    '& div:first-child': {
      border: 'none',
    },
  }),
}

const ProifleDocumentFeed = ({
  documents,
  loadMore,
  customStyles = undefined,
  showTitle = false,
}) => {
  const { t } = useTranslation()
  if (!documents || !documents.totalCount) {
    return null
  }

  const hasMore = documents.pageInfo && documents.pageInfo.hasNextPage
  const totalCount = documents.totalCount
  const currentCount = documents.nodes.length

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loadMore={loadMore}
      totalCount={totalCount}
      currentCount={currentCount}
      loadMoreStyles={merge(styles.loadMore, customStyles)}
      customStyles={styles.noBorder}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: showTitle ? 'space-between' : 'flex-end',
          marginBottom: !showTitle && 16,
        }}
      >
        {showTitle && (
          <Interaction.H3 style={{ marginBottom: 20 }}>
            {t.pluralize('profile/documents/title', {
              count: totalCount,
            })}
          </Interaction.H3>
        )}
      </div>
      {documents.nodes.map((doc) => (
        <TeaserFeed
          {...doc.meta}
          title={doc.meta.shortTitle || doc.meta.title}
          description={!doc.meta.shortTitle && doc.meta.description}
          Link={HrefLink}
          key={doc.meta.path}
          bar={<ActionBar mode='feed' document={doc} />}
        />
      ))}
    </InfiniteScroll>
  )
}

export default ProifleDocumentFeed
