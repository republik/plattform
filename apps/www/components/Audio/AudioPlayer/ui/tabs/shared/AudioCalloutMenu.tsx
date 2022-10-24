import {
  useColorContext,
  CalloutMenu,
  MoreIcon,
  IconButton,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { ComponentType } from 'react'

const styles = {
  menuWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    '> *:not(:last-child)': {
      marginBottom: '15px',
    },
  }),
}

export type AudioListItemAction = {
  Icon: ComponentType
  label: string
  onClick: () => void | Promise<void>
}

const AudioCalloutMenu = ({ actions }: { actions: AudioListItemAction[] }) => {
  const [colorScheme] = useColorContext()

  return (
    <CalloutMenu
      contentPaddingMobile={'30px'}
      Element={MoreIcon}
      align='right'
      elementProps={{
        ...colorScheme.set('fill', 'textSoft'),
        size: 20,
      }}
    >
      <div {...styles.menuWrapper}>
        {actions.map(({ Icon, label, onClick }) => (
          <IconButton
            key={label}
            label={label}
            labelShort={label}
            Icon={Icon}
            onClick={onClick}
          />
        ))}
      </div>
    </CalloutMenu>
  )
}

export default AudioCalloutMenu
