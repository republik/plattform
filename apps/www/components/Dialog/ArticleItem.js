import { css } from 'glamor'

import { Interaction, useColorContext } from '@project-r/styleguide'

const styles = {
  container: css({
    display: 'inline-block',
    position: 'relative',
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  count: css({
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    position: 'absolute',
    right: 0,
  }),
}

const ArticleItem = ({ title, count }) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      {...styles.container}
      style={{
        paddingRight: count ? 10 + String(count).length * 12 : 0,
      }}
    >
      <span>{title}</span>
      {count && (
        <span {...styles.count} {...colorScheme.set('color', 'primary')}>
          {count}
        </span>
      )}
    </span>
  )
}

export default ArticleItem
