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
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    paddingLeft: 150,
    position: 'relative'
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 150,
    padding: '0 0 0 7px',
    borderRight: `1px solid ${colors.divider}`
  },
  document: {
    overflow: 'scroll',
    width: '100%',
    height: `calc(100vh - ${HEADER_HEIGHT}px)`
  }
}
