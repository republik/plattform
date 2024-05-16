import React, { ComponentPropsWithoutRef } from 'react'
import { css } from 'glamor'
import CalloutMenu from '../../../Callout/CalloutMenu'
import IconButton from '../../../IconButton'
import { useColorContext } from '../../../Colors/ColorContext'
import { IconMoreVertical } from '@republik/icons'
import { IconType } from '../../../../types/icon'

const MoreIconWithProps = (
  props: ComponentPropsWithoutRef<typeof IconButton>,
) => <IconButton title='Mehr' Icon={IconMoreVertical} {...props} />

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

export type ActionMenuItem = {
  label: string
  icon: IconType
  onClick: () => void
  disabled?: boolean
}

type ActionsMenuProps = {
  items?: ActionMenuItem[]
}

const ActionsMenu = ({ items = [] }: ActionsMenuProps) => {
  const [colorScheme] = useColorContext()

  if (items.length === 0) {
    return null
  }

  return (
    <CalloutMenu
      contentPaddingMobile={'30px'}
      Element={MoreIconWithProps}
      align='right'
      elementProps={{
        ...colorScheme.set('fill', 'textSoft'),
        size: 20,
      }}
    >
      <div {...styles.menuWrapper}>
        {items.map((item) => (
          <IconButton
            key={item.label}
            Icon={item.icon}
            label={item.label}
            labelShort={item.label}
            disabled={item.disabled}
            onClick={item.onClick}
          />
        ))}
      </div>
    </CalloutMenu>
  )
}

export default ActionsMenu
