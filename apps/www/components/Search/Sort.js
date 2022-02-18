import React, { useMemo } from 'react'
import { css } from 'glamor'

import { ArrowDownIcon, ArrowUpIcon } from '@project-r/styleguide'
import {
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withSearchRouter from './withSearchRouter'
import { SUPPORTED_SORT } from './constants'

import withT from '../../lib/withT'
import Link from 'next/link'

const styles = {
  container: css({
    paddingTop: '3px',
  }),
  link: css({
    ...fontStyles.sansSerifRegular14,
    marginRight: '17px',
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular16,
      marginRight: '30px',
    },
  }),
  linkRegular: css({
    textDecoration: 'none',
  }),
  linkSelected: css({
    textDecoration: 'underline',
    textDecorationSkip: 'ink',
  }),
  icon: css({
    display: 'inline-block',
    lineHeight: 0,
    verticalAlign: 'text-bottom',
  }),
}

const SORT_DIRECTION_ICONS = {
  ASC: ArrowDownIcon,
  DESC: ArrowUpIcon,
}

const getDefaultDirection = (sort) => sort.directions && sort.directions[0]

const getNextDirection = (sort, directions) => {
  const index = directions.indexOf(sort.direction)
  return index === directions.length - 1 ? directions[0] : directions[index + 1]
}

const SortToggle = compose(withT)(({ t, sort, urlSort, getSearchParams }) => {
  const selected = urlSort.key === sort.key
  const label = t(`search/sort/${sort.key}`)
  const direction = selected ? urlSort.direction : getDefaultDirection(sort)
  const [colorScheme] = useColorContext()
  const linkHover = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <Link
      href={{
        pathname: '/suche',
        query: getSearchParams({
          sort: {
            key: sort.key,
            direction:
              selected && direction
                ? getNextDirection(urlSort, sort.directions)
                : direction,
          },
        }),
      }}
      passHref
    >
      <a
        {...styles.link}
        {...styles[selected ? 'linkSelected' : 'linkRegular']}
        {...(!selected && linkHover)}
        {...colorScheme.set('color', 'text')}
      >
        {label}
        {direction && (
          <span
            {...styles.icon}
            role='button'
            title={t(`search/sort/${direction}/aria`)}
          >
            {React.createElement(SORT_DIRECTION_ICONS[direction])}
          </span>
        )}
      </a>
    </Link>
  )
})

const Sort = compose(withSearchRouter)(
  ({ urlQuery, urlSort, getSearchParams }) => {
    return (
      <div {...styles.container}>
        {SUPPORTED_SORT.filter((sort) => urlQuery || !sort.needsQuery).map(
          (sort, key) => (
            <SortToggle
              key={key}
              sort={sort}
              urlSort={urlSort}
              getSearchParams={getSearchParams}
            />
          ),
        )}
      </div>
    )
  },
)

export default Sort
