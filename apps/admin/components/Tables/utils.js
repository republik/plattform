import { css } from 'glamor'
import SortIndicator from '../SortIndicator'

export const tableStyles = {
  table: css({
    width: '100%',
    borderSpacing: 0,
  }),
  link: css({
    textDecoration: 'none',
    color: 'var(--color-primary)',
    ':visited': {
      color: 'var(--color-primary)',
    },
    ':hover': {
      color: 'var(--color-primaryHover)',
    },
    cursor: 'pointer',
  }),
  row: css({
    height: '35px',
    '&:nth-child(odd)': {
      backgroundColor: 'var(--color-hover)',
    },
  }),
  headRow: css({
    height: '40px',
    backgroundColor: '#fff',
    '&:nth-child(1) th': {
      borderBottom: `1px solid ${'var(--color-divider)'}`,
      background: 'white',
      position: 'sticky',
      top: -20,
      zIndex: 10,
    },
  }),
  selectableRow: css({
    '& td': {
      transition: 'border-color 0.2s',
      borderTop: `1px solid transparent`,
      borderBottom: `1px solid transparent`,
    },
    '&[data-active="true"] td': {
      transition: 'none',
      borderColor: 'var(--color-primaryHover)',
    },
    '&:hover, &[data-active="true"]': {
      color: 'var(--color-primary)',
    },
    transition: 'color 0.2s',
    cursor: 'pointer',
  }),
  emphasisedRow: css({
    '& td': {
      borderBottom: `1px solid ${'var(--color-text)'}`,
    },
  }),
  left: css({
    textAlign: 'left',
  }),
  right: css({
    textAlign: 'right',
  }),
  center: css({
    textAlign: 'center',
  }),
  paddedCell: css({
    padding: '15px 2px',
  }),
}

const identity = (v) => v

export const createChangeHandler =
  (params, handler) => (fieldName, serializer) => (value) => {
    const s = serializer || identity
    if (value) {
      handler({
        ...params,
        ...{ [fieldName]: s(value) },
      })
    } else {
      delete params[fieldName]
      handler(params)
    }
  }

export const createSortHandler = (sort, handler) => (fieldName) => () => {
  if (sort.field !== fieldName) {
    return handler({
      field: fieldName,
      direction: 'ASC',
    })
  } else {
    return handler({
      field: sort.field,
      direction: sort.direction === 'ASC' ? 'DESC' : 'ASC',
    })
  }
}

export const createSortIndicator = (sort) => (fieldName) => {
  if (sort.field === fieldName) {
    return <SortIndicator sortDirection={sort.direction} />
  } else {
    return null
  }
}

export const deserializeOrderBy = (str) => {
  if (!str) {
    return {
      field: 'createdAt',
      direction: 'DESC',
    }
  }
  const [field, direction] = str.split('-')
  return {
    field: field.toString(),
    direction,
  }
}

export const serializeOrderBy = ({ field, direction }) =>
  `${field}-${direction}`
