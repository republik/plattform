import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import SortIndicator from '../SortIndicator'

export const tableStyles = {
  table: css({
    width: '100%',
    borderSpacing: 0
  }),
  link: css({
    textDecoration: 'none',
    color: colors.primary,
    ':visited': {
      color: colors.primary
    },
    ':hover': {
      color: colors.secondary
    },
    cursor: 'pointer'
  }),
  row: css({
    height: '35px',
    '&:nth-child(odd)': {
      backgroundColor: colors.secondaryBg
    }
  }),
  headRow: css({
    height: '40px',
    backgroundColor: '#fff',
    '&:nth-child(1) th': {
      borderBottom: `1px solid ${colors.divider}`,
      background: 'white',
      position: 'sticky',
      top: -20,
      zIndex: 10
    }
  }),
  selectableRow: css({
    '& td': {
      transition: 'border-color 0.2s',
      borderTop: `1px solid ${colors.secondary}00`,
      borderBottom: `1px solid ${colors.secondary}00`
    },
    '&[data-active="true"] td': {
      transition: 'none',
      borderColor: colors.secondary
    },
    '&:hover, &[data-active="true"]': {
      color: colors.primary
    },
    transition: 'color 0.2s',
    cursor: 'pointer'
  }),
  emphasisedRow: css({
    '& td': {
      borderBottom: `1px solid ${colors.text}`
    }
  }),
  left: css({
    textAlign: 'left'
  }),
  right: css({
    textAlign: 'right'
  }),
  center: css({
    textAlign: 'center'
  }),
  paddedCell: css({
    padding: '15px 2px'
  })
}

const identity = v => v

export const createChangeHandler = (params, handler) => (
  fieldName,
  serializer
) => value => {
  const s = serializer || identity
  if (value) {
    handler({
      ...params,
      ...{ [fieldName]: s(value) }
    })
  } else {
    delete params[fieldName]
    handler(params)
  }
}

export const createSortHandler = (
  sort,
  handler
) => fieldName => () => {
  if (sort.field !== fieldName) {
    return handler({
      field: fieldName,
      direction: 'ASC'
    })
  } else {
    return handler({
      field: sort.field,
      direction: sort.direction === 'ASC' ? 'DESC' : 'ASC'
    })
  }
}

export const createSortIndicator = sort => fieldName => {
  if (sort.field === fieldName) {
    return <SortIndicator sortDirection={sort.direction} />
  } else {
    return null
  }
}

export const deserializeOrderBy = str => {
  if (!str) {
    return {
      field: 'createdAt',
      direction: 'DESC'
    }
  }
  const [field, direction] = str.split('-')
  return {
    field: field.toString(),
    direction
  }
}

export const serializeOrderBy = ({ field, direction }) =>
  `${field}-${direction}`
