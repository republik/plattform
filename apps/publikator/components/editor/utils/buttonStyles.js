import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const base = {
  cursor: 'pointer',
  color: colors.secondary,
  transition: 'color 0.1s, opacity 0.1s',
  '&[data-visible="false"]': {
    display: 'none',
  },
}

const format = {
  ...base,
  '&[data-active="true"]': {
    color: colors.primary,
  },
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: colors.secondary,
  },
  '&[data-active="false"][data-disabled="false"]:hover': {
    color: colors.text,
  },
}

const action = {
  ...base,
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: colors.secondary,
  },
  '&[data-disabled="false"]:hover': {
    color: colors.text,
  },
}

export default {
  base: css(base),
  format: css(format),
  action: css(action),
  mark: css({
    textAlign: 'center',
    display: 'inline-block',
    width: '30px',
    ...format,
  }),
  block: css({
    display: 'block',
    ...format,
  }),
  insert: css({
    display: 'block',
    ...action,
  }),
}
