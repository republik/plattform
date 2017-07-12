import { compose } from 'redux'
import { createTile, createContainer } from '../Layout/Grid'

export const Table = createContainer({
  direction: 'column',
  justifyContent: 'start'
})('div')

export const Row = compose(
  createTile(),
  createContainer({
    direction: 'row',
    justifyContent: 'stretch'
  })
)('div')

export const Cell = compose(
  createTile(),
  createContainer({
    direction: 'column',
    justifyContent: 'center'
  })
)('div')
