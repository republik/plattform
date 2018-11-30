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
    '&:nth-child(even)': {
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
  left: css({
    textAlign: 'left'
  }),
  right: css({
    textAlign: 'right'
  }),
  center: css({
    textAlign: 'center'
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

export const displayDate = rawDate => {
  const date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
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

export const deserializeOrderBy = (
  str
) => {
  if (!str) {
    return
  }
  const [field, direction] = str.split('-')
  return {
    field: field.toString(),
    direction
  }
}

export const serializeOrderBy = ({
  field,
  direction
}) => `${field}-${direction}`
