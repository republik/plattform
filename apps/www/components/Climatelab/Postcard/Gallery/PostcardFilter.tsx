import { css } from 'glamor'
import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import AssetImage from '../../../../lib/images/AssetImage'

const styles = {
  container: css({
    position: 'relative',
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
    /* Rotate it. Change the number of degrees for the following cards */
    transform: 'rotate(-8deg)',
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

type PostcardFilterProps = {
  imageUrl: string
  count: number
  nextCard: (a: object) => void
}

const PostcardFilter: React.FC<PostcardFilterProps> = ({
  count,
  imageUrl,
  nextCard,
}) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container}>
      <div {...styles.pileContainer}>
        <div
          {...styles.pileCard}
          {...colorScheme.set('borderColor', 'divider')}
        />
        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(-6deg)' }}
          {...colorScheme.set('borderColor', 'divider')}
        />
        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(-4deg)' }}
          {...colorScheme.set('borderColor', 'divider')}
        />
        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(-2deg)' }}
          {...colorScheme.set('borderColor', 'divider')}
        />
        <div
          {...styles.pileCard}
          style={{ transform: 'rotate(0)' }}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <button {...plainButtonRule} {...styles.image}>
            <AssetImage width={'200'} height={'133'} src={imageUrl} />
          </button>
        </div>
      </div>
      <div {...styles.count}>{count}</div>
    </div>
  )
}

export default PostcardFilter
