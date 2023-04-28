import {
  useColorContext,
  CalloutMenu,
  IconButton,
} from '@project-r/styleguide'
import { IconMoreVertical } from '@republik/icons'
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
  hidden?: boolean
}

const MoreIconButton = (props) => <IconButton Icon={IconMoreVertical} {...props} />

const AudioCalloutMenu = ({ actions }: { actions: AudioListItemAction[] }) => {
  const [colorScheme] = useColorContext()
  const activeActions = actions.filter(({ hidden }) => !hidden)

  if (!activeActions?.length) return null

  return (
    <CalloutMenu
      contentPaddingMobile={'30px'}
      Element={MoreIconButton}
      align='right'
      elementProps={{
        ...colorScheme.set('fill', 'textSoft'),
        size: 20,
      }}
    >
      <div {...styles.menuWrapper}>
        {activeActions.map(({ Icon, label, onClick }) => (
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
