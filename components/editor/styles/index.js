import { colors } from '@project-r/styleguide'

export default {
  blockButton: {
    display: 'block',
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
}
