import { useState, useEffect } from 'react'
import { css } from 'glamor'
import {
  FormatTag,
  useColorContext,
  useHeaderHeight,
  Scroller,
} from '@project-r/styleguide'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { rerouteDiscussion } from '../shared/DiscussionLink'

const BREAKOUT_PADDING = 15 // Center.PADDING

const styles = {
  container: css({
    position: 'sticky',
    zIndex: 10,
    margin: '24px 0',
  }),
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    position: 'absolute',
    bottom: 0,
    height: 1,
    left: 0,
    right: 0,
  }),
  tagLinkContainer: css({
    // FormatTag have margin: '0 5px 15px' to keep in mind
    padding: '15px 0 10px',
    marginRight: 10,
    whiteSpace: 'nowrap',
  }),
}

const TagLink = ({ tag, commentCount }) => {
  const route = useRouter()
  const {
    query: { tag: activeTag },
  } = route
  const isSelected = tag === activeTag
  const targetHref = rerouteDiscussion(route, {
    tag: isSelected ? undefined : tag,
  })
  return (
    <div {...styles.tagLinkContainer}>
      <Link href={targetHref} scroll={false} prefetch={false}>
        <FormatTag
          color={isSelected ? 'text' : 'textSoft'}
          label={tag || 'Alle'}
          count={commentCount}
        />
      </Link>
    </div>
  )
}

const TagFilter = ({ discussion }) => {
  const [colorScheme] = useColorContext()
  const headerHeight = useHeaderHeight()
  const route = useRouter()
  const {
    query: { tag: activeTag },
  } = route

  const [isEdge2Edge, setEdge2Edge] = useState(false)
  useEffect(() => {
    const handleResize = () => {
      setEdge2Edge(window.innerWidth <= 665 + BREAKOUT_PADDING) // Center.MAX_WIDTH + BREAKOUT_PADDING
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!discussion.tags?.length) {
    return null
  }

  // undefined for all tag at the start
  const tags = [undefined, ...discussion.tags]
  const tagBuckets = discussion.tagBuckets
  const totalCount = discussion.allComments.totalCount

  return (
    <div
      {...styles.container}
      {...colorScheme.set('background', 'default')}
      style={{
        top: headerHeight,
        ...(isEdge2Edge && {
          marginLeft: -BREAKOUT_PADDING,
          marginRight: -BREAKOUT_PADDING,
        }),
      }}
    >
      <Scroller
        innerPadding={isEdge2Edge ? BREAKOUT_PADDING : 0}
        activeChildIndex={tags.findIndex((tag) => tag === activeTag)}
      >
        {tags.map((tag, i) => (
          <TagLink
            key={tag || i}
            tag={tag}
            commentCount={
              !tag
                ? totalCount
                : tagBuckets.find((t) => t.value === tag)?.count || 0
            }
          />
        ))}
      </Scroller>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default TagFilter
