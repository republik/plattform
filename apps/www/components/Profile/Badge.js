import { merge } from 'glamor'
import { IconButton, useColorContext } from '@project-r/styleguide'
import withT from '../../lib/withT'

// currently unused, example:
const BADGES = {
  // CROWDFUNDER: {
  //   translation: 'badge/crowdfunder',
  //   icon: 'crowdfunder'
  // }
}

const styles = {
  badge: {
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'inline-block',
    textAlign: 'center',
    '& + &': {
      marginLeft: '10px',
    },
  },
}

const Badge = ({ t, badge, size }) => {
  const badgeData = BADGES[badge]
  const [colorScheme] = useColorContext()
  if (!badgeData) {
    return null
  }
  return (
    <span
      {...merge(styles.badge, {
        height: `${size}px`,
        width: `${size}px`,
        borderRadius: `${size}px`,
      })}
      {...colorScheme.set('backgroundColor', 'divider')}
      {...colorScheme.set('borderColor', 'textSoft')}
      title={t(badgeData.translation)}
    >
      <IconButton Icon={badgeData.icon} />
    </span>
  )
}

export default withT(Badge)
