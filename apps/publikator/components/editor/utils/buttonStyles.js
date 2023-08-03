import { css } from 'glamor'

const base = {
  cursor: 'pointer',
  color: 'var(--color-secondary)',
  transition: 'color 0.1s, opacity 0.1s',
  '&[data-visible="false"]': {
    display: 'none',
  },
}

const format = {
  ...base,
  '&[data-active="true"]': {
    color: 'var(--color-primary)',
  },
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: 'var(--color-secondary)',
  },
  '&[data-active="false"][data-disabled="false"]:hover': {
    color: 'var(--color-text)',
  },
}

const action = {
  ...base,
  '&[data-disabled="true"]': {
    opacity: 0.3,
    color: 'var(--color-secondary)',
  },
  '&[data-disabled="false"]:hover': {
    color: 'var(--color-text)',
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
