import { colors } from '@project-r/styleguide'
import { HEADER_HEIGHT } from '../../Frame/constants'

const button = {
  cursor: 'pointer',
  color: colors.secondary,
  transition: 'color 0.1s, opacity 0.1s',
  '&[data-visible="false"]': {
    display: 'none'
  }
}

const formatButton = {
  ...button,
  '&[data-active="true"]': {
    color: colors.primary
  },
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: colors.secondary
  },
  '&[data-active="false"][data-disabled="false"]:hover': {
    color: colors.text
  }
}

const actionButton = {
  ...button,
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: colors.secondary
  },
  '&[data-disabled="false"]:hover': {
    color: colors.text
  }
}

export const mq = {
  medium: '@media (min-width: 600px)',
  large: '@media (min-width: 900px)'
}

export default {
  button,
  formatButton,
  actionButton,
  markButton: {
    textAlign: 'center',
    display: 'inline-block',
    width: '30px',
    ...formatButton
  },
  blockButton: {
    display: 'block',
    ...formatButton
  },
  insertButton: {
    display: 'block',
    ...actionButton
  },
  container: {
    width: '100%',
    paddingLeft: 170,
    position: 'relative'
  },
  sidebar: {
    position: 'fixed',
    top: HEADER_HEIGHT,
    left: 0,
    bottom: 0,
    width: 170,
    overflow: 'auto',
    padding: '0 7px 10px',
    borderRight: `1px solid ${colors.divider}`
  },
  document: {
    width: '100%'
  }
}
