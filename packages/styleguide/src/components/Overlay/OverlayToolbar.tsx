import React, { MouseEventHandler, ReactElement, ReactNode } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { CloseIcon } from '../Icons'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifMedium16 } from '../Typography/styles'

export const height = 48

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    height: `${height}px`,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: 100,
    ...sansSerifMedium16,
    paddingLeft: 12,
    [mUp]: {
      position: 'absolute',
      paddingLeft: 20,
    },
  }),
  close: css({
    fontSize: '24px',
    height: `${height}px`,
    width: '38px',
    flexBasis: '38px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    padding: '0',
    background: 'transparent',
    marginLeft: 'auto',
    // For some reason 'justify-content' doesn't work in iOS, so
    // use auto margin to center the icon inside the button.
    '& > svg': {
      margin: '0 auto',
    },
    [mUp]: {
      width: '48px',
      flexBasis: '48px',
    },
  }),
}

const OverlayToolbarClose = ({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>
}): ReactElement => {
  const [colorScheme] = useColorContext()
  return (
    <button {...styles.close} onClick={onClick}>
      <CloseIcon {...colorScheme.set('fill', 'text')} />
    </button>
  )
}
OverlayToolbarClose.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export const OverlayToolbar: React.FC<{
  title: string | ReactNode
  onClose: MouseEventHandler<HTMLButtonElement>
}> = ({ title, onClose, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.root}
      {...colorScheme.set('borderColor', 'divider')}
      {...colorScheme.set('backgroundColor', 'overlay')}
    >
      {title}
      {onClose && <OverlayToolbarClose onClick={onClose} />}
      {children}
    </div>
  )
}

OverlayToolbar.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.node,
}
