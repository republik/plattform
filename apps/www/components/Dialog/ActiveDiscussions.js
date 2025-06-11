import { Component, useMemo } from 'react'
import { css, merge } from 'glamor'
import compose from 'lodash/flowRight'

import ArticleItem from './ArticleItem'
import { withActiveDiscussions } from './enhancers'

import DiscussionLink from '../Discussion/shared/DiscussionLink'

import {
  Loader,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'

const styles = {
  item: merge(
    css({
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      textAlign: 'left',
      padding: '16px 0',
      cursor: 'pointer',
      '& ~ &': {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
      },
      '@media(hover)': {
        '&:hover': {
          margin: '0 -15px',
          padding: '16px 15px',
          width: 'calc(100% + 30px)',
        },
        '&:hover + &': {
          borderColor: 'transparent',
        },
        '& + &:hover': {
          borderColor: 'transparent',
        },
      },
      ...fontStyles.sansSerifRegular18,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifRegular21,
      },
    }),
  ),
}

const ActiveDiscussionItem = ({ discussion, label, count }) => {
  const [colorScheme] = useColorContext()
  const itemRule = useMemo(
    () =>
      css({
        '& ~ &': {
          borderColor: colorScheme.getCSSColor('divider'),
        },
        '@media(hover)': {
          '&:hover': {
            background: colorScheme.getCSSColor('hover'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <DiscussionLink discussion={discussion} passHref>
      <a {...styles.item} {...itemRule} {...colorScheme.set('color', 'text')}>
        <ArticleItem
          title={label}
          iconSize={24}
          count={count}
          image={discussion.document?.meta?.image}
        />
      </a>
    </DiscussionLink>
  )
}

class ActiveDiscussions extends Component {
  render() {
    const { data } = this.props

    const activeDiscussions =
      data &&
      data.activeDiscussions &&
      data.activeDiscussions.filter(
        (activeDiscussion) => !activeDiscussion.discussion.closed,
      )

    return (
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          return (
            <div>
              {activeDiscussions &&
                activeDiscussions.map((activeDiscussion) => {
                  const discussion = activeDiscussion.discussion
                  return (
                    <ActiveDiscussionItem
                      key={discussion.id}
                      label={discussion.title}
                      discussion={discussion}
                      count={discussion.comments.totalCount}
                    />
                  )
                })}
            </div>
          )
        }}
      />
    )
  }
}

export default compose(withActiveDiscussions)(ActiveDiscussions)
