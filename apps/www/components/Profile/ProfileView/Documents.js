import { Interaction, TeaserFeed } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import HrefLink from '../../Link/Href'
import ActionBar from '../../ActionBar'
import InfiniteScroll from '../../Frame/InfiniteScroll'
import { css, merge } from 'glamor'

const styles = {
  loadMore: css({
    marginTop: -30,
    marginBottom: 40,
  }),
}

const Documents = ({ t, documents, loadMore, customStyles }) => {
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
    >
      <Interaction.H3 style={{ marginBottom: 20 }}>
        {t.pluralize('profile/documents/title', {
          count: documents.totalCount,
        })}
      </Interaction.H3>
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

export default withT(Documents)
