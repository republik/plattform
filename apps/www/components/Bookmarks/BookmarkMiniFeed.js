import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  Loader,
  useColorContext,
} from '@project-r/styleguide'
import BookmarkButton from '../ActionBar/BookmarkButton'
import UserProgress from '../ActionBar/UserProgress'
import { getCollectionItems } from './queries'
import Link from 'next/link'

const BookmarkMiniFeed = ({ data, style }) => {
  const [colorScheme] = useColorContext()
  return (
    <Loader
      style={{ minHeight: 130 }}
      delay={200}
      loading={data.loading}
      error={data.error}
      render={() => {
        // only members have a bookmark collection
        if (!data.me?.collectionItems) {
          return null
        }
        const { nodes } = data.me.collectionItems
        return (
          <div {...styles.tilesContainer} style={style}>
            {nodes
              .filter((node) => node.document)
              .slice(0, 3)
              .map((node) => {
                const { userProgress, userBookmark, id } = node.document
                const meta = node.document.meta
                const { estimatedReadingMinutes, title, path } = meta
                return (
                  <div
                    {...styles.tile}
                    {...colorScheme.set('borderColor', 'divider')}
                    key={node.id}
                  >
                    <div {...styles.tileHeadlineContainer}>
                      <Link
                        href={path}
                        passHref
                        {...styles.tileHeadline}
                        {...colorScheme.set('color', 'text')}
                      >
                        {title.substring(0, 42).trim()}
                        {title.length >= 42 && <>&nbsp;…</>}
                      </Link>
                    </div>
                    <div {...styles.iconContainer}>
                      <BookmarkButton
                        documentId={id}
                        bookmarked={!!userBookmark}
                        skipRefetch
                      />
                      {userProgress && estimatedReadingMinutes > 1 && (
                        <UserProgress
                          documentId={id}
                          forceShortLabel
                          noCallout
                          noScroll
                          userProgress={userProgress}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            <div {...styles.spacer} />
          </div>
        )
      }}
    />
  )
}

const styles = {
  tilesContainer: css({
    width: '100%',
    display: 'flex',
    gap: '16px',
    flexDirection: 'row',
    overflow: 'visible',
    overflowX: 'scroll',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  tile: css({
    width: 150,
    height: 150,
    flex: '0 0 150px',
    padding: '16px 8px 12px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      padding: '12px 8px',
      height: 120,
      flex: '0 0 210px',
    },
  }),
  spacer: css({
    flex: '0 0 8px',
    [mediaQueries.mUp]: {
      flex: 0,
      display: 'none',
    },
  }),
  tileHeadlineContainer: css({
    flex: 1,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
  }),
  tileHeadline: css({
    textDecoration: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    wordWrap: 'break-word',
    width: '100%',
    ...fontStyles.serifBold17,
    lineHeight: '18px',
    [mediaQueries.mUp]: {
      ...fontStyles.serifBold19,
      lineHeight: '21px',
    },
  }),
  iconContainer: css({
    display: 'flex',
  }),
}

export default compose(
  graphql(getCollectionItems, {
    options: (props) => ({
      variables: props.variables,
    }),
  }),
)(BookmarkMiniFeed)
