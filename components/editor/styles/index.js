import { colors } from '@project-r/styleguide'

const formatButton = {
  cursor: 'pointer',
  color: colors.secondary,
  transition: 'color 0.1s, opacity 0.1s',
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

export default {
  formatButton,
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
  container: {
    width: '100vw',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'stretch'
  },
  sidebar: {
    flex: '0 0 180px',
    padding: '15px 0 0 7px',
    borderRight: `1px solid ${colors.divider}`
  },
  document: {
    height: '100vh',
    overflowY: 'scroll',
    flex: '1 0 auto'
  }
}
