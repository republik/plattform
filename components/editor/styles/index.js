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
  }
}
