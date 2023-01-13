import { css } from 'glamor'
import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'
import { scaleLinear } from 'd3-scale'

const styles = {
  container: css({
    position: 'relative',
    marginBottom: '10px',
  }),
  pileContainer: css({
    position: 'relative',
    width: '150px',
    height: '99.75px',
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
    background: '#FFFFFF',
  }),
  image: css({
    '> span': { display: 'block !important' },
  }),
  count: css({
    marginTop: '5px',
    width: '100%',
    textAlign: 'right',
    fontSize: '1rem',
  }),
}

const cardsAmount = scaleLinear().domain([600, 1300]).range([4, 10])

type PostcardFilterProps = {
  subject: string
  imageUrl: string
  count: number
  onFilterClicked: (a: string) => void
}

const PostcardFilter: React.FC<PostcardFilterProps> = ({
  subject,
  imageUrl,
  count,
  onFilterClicked,
}) => {
  const [colorScheme] = useColorContext()
  const maxCards = Math.round(cardsAmount(count))
  const amountOfCards = Array(maxCards)
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
        {amountOfCards.map((d, i) => {
          return (
            <div
              key={d}
              {...styles.pileCard}
              style={{ transform: `rotate(-${rotations[d]}deg)` }}
              {...colorScheme.set('borderColor', 'divider')}
            />
          )
        })}

        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(0)' }}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <button
            onClick={() => onFilterClicked(subject)}
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
