import { css } from 'glamor'
import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'
import { scaleLinear } from 'd3-scale'
import { useEffect, useState } from 'react'

const styles = {
  container: css({
    position: 'relative',
    flexGrow: '1',
    boxSizing: 'border-box',
  }),
  pileContainer: css({
    position: 'relative',
    width: '100%',
    aspectRatio: '3 / 2',
  }),
  pileCard: css({
    /* Absolute position */
    left: '0px',
    position: 'absolute',
    top: '0px',
    /* Take full size */
    height: '100%',
    width: '100%',
    /* Displayed under the container */
    zIndex: '1',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '2px',
  }),
  image: css({
    '> span': { display: 'block !important' },
  }),
  count: css({
    position: 'absolute',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    zIndex: '10',
    top: '0.3rem',
    right: '0.3rem',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    lineHeight: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.25rem',
    padding: '2px',
    minWidth: '20px',
  }),
}

const cardsAmount = scaleLinear().domain([30, 300]).range([4, 10])

type PostcardFilterProps = {
  subject: string
  imageUrl: string
  count: number | undefined
  onFilterClicked: (a: string) => boolean
}

const PostcardFilter: React.FC<PostcardFilterProps> = ({
  subject,
  imageUrl,
  count: initialCount,
  onFilterClicked,
}) => {
  // Keep current count in state because a) it resets to 0 during refetch and b) this way we can decrement by 1 on each click
  const [count, setCount] = useState<number | undefined>()

  // Set and keep count once
  useEffect(() => {
    if (count === undefined && initialCount !== undefined) {
      setCount(initialCount)
    }
  }, [initialCount, count])

  const [colorScheme] = useColorContext()
  const maxCards = Math.round(cardsAmount(count ?? 0))
  const amountOfCards = Array(Math.max(maxCards, 1))
    .fill(null)
    .map((_, i) => i)
  const rotations = Array(maxCards + 2)
    .fill(null)
    .map((_, i) => i + 2)
    .filter((n) => n % 2 === 0)
    .reverse()
  return (
    <div {...styles.container}>
      <div {...styles.pileContainer}>
        {amountOfCards.map((d) => {
          return (
            <div
              key={d}
              {...styles.pileCard}
              style={{ transform: `rotate(-${rotations[d]}deg)` }}
              {...colorScheme.set('borderColor', 'divider')}
              {...colorScheme.set('backgroundColor', 'default')}
            />
          )
        })}

        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(0)' }}
          {...colorScheme.set('borderColor', 'divider')}
          {...colorScheme.set('backgroundColor', 'default')}
        >
          <button
            onClick={() => {
              const hasFetchedNext = onFilterClicked(subject)
              if (hasFetchedNext) {
                setCount((count) => Math.max(0, count - 1))
              }
            }}
            {...plainButtonRule}
            {...styles.image}
          >
            <AssetImage width={'200'} height={'133'} src={imageUrl} />
          </button>
        </div>
      </div>
      <div {...styles.count}>{count}</div>
    </div>
  )
}

export default PostcardFilter
