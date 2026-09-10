import { css } from 'glamor'
import Image from 'next/image'
import {
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { IconDiscussion } from '@republik/icons'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  }),
  textContainer: css({
    flex: 1,
    minWidth: 0,
  }),
  title: css({
    ...fontStyles.serifRegular,
    fontSize: 18,
    lineHeight: '1.5',
    marginBottom: 4,
    [mediaQueries.mUp]: {
      fontSize: 22,
    },
  }),
  count: css({
    ...fontStyles.sansSerifRegular16,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    flexShrink: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
    },
  }),
  imageContainer: css({
    flexShrink: 0,
    maxWidth: '33.333%',
    width: '100%',
    aspectRatio: '1/1',
    position: 'relative',
    overflow: 'hidden',
    [mediaQueries.mUp]: {
      aspectRatio: '4/3',
    },
  }),
  fallbackContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  }),
  fallbackIcon: css({
    zIndex: 1,
    opacity: 0.3,
  }),
}

const ArticleItem = ({ title, count }) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.container}>
      <div {...styles.textContainer}>
        <p {...styles.title}>{title}</p>
        {count && (
          <span {...styles.count} {...colorScheme.set('color', 'primary')}>
            {count} Beiträge
          </span>
        )}
      </div>
    </div>
  )
}

export default ArticleItem
