import { IconMoreVertical } from '@republik/icons'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { IconType } from '../../../../types/icon'
import CalloutMenu from '../../../Callout/CalloutMenu'
import { useColorContext } from '../../../Colors/ColorContext'
import IconButton from '../../../IconButton'

const MoreIconWithProps = (props) => (
  <IconButton title='Mehr' Icon={IconMoreVertical} {...props} />
)

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

type Props = {
  items?: ActionMenuItem[]
}

const ActionsMenu = ({ items = [] }: Props) => {
  const [colorScheme] = useColorContext()

  if (items.length === 0) {
    return null
  }

  return (
    <CalloutMenu
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
            size={16}
          />
        ))}
      </div>
    </CalloutMenu>
  )
}

export const ActionsMenuItemPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
})
ActionsMenu.propTypes = {
  items: PropTypes.arrayOf(ActionsMenuItemPropType).isRequired,
}

export default ActionsMenu
