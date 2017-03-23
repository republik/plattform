import React, {PropTypes} from 'react'
import {css} from 'glamor'
import {onlyS, mUp} from '../../theme/mediaQueries'

export const GUTTER = 20
export const CONTENT_PADDING = 20

export const NARROW_CONTENT_MAX_WIDTH = 650
export const MEDIUM_CONTENT_MAX_WIDTH = 1024
export const CONTENT_MAX_WIDTH = 1440

const styles = {
  container: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  }),
  narrowContainer: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: NARROW_CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  }),
  mediumContainer: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: MEDIUM_CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto'
  }),
  grid: css({
    clear: 'both',
    overflow: 'auto',
    zoom: '1',
    marginLeft: `-${GUTTER / 2}px`,
    width: `calc(100% + ${GUTTER}px)`
  }),
  span: css({
    boxSizing: 'border-box',
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`
  }),
  s1of2: css({[onlyS]: {width: '50%'}}),
  s2of2: css({[onlyS]: {width: '100%'}}),
  m1of6: css({[mUp]: {width: `${100 / 6 * 1}%`}}),
  m2of6: css({[mUp]: {width: `${100 / 6 * 2}%`}}),
  m3of6: css({[mUp]: {width: `${100 / 6 * 3}%`}}),
  m4of6: css({[mUp]: {width: `${100 / 6 * 4}%`}}),
  m5of6: css({[mUp]: {width: `${100 / 6 * 5}%`}}),
  m6of6: css({[mUp]: {width: `${100 / 6 * 6}%`}})
}

export const Container = ({children}) => (
  <div {...styles.container}>
    {children}
  </div>
)

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.any
}

export const NarrowContainer = ({children}) => (
  <div {...styles.narrowContainer}>
    {children}
  </div>
)

NarrowContainer.propTypes = {
  children: PropTypes.node
}

export const MediumContainer = ({children}) => (
  <div {...styles.mediumContainer}>
    {children}
  </div>
)

MediumContainer.propTypes = {
  children: PropTypes.node
}

export const Grid = ({children}) => (
  <div {...styles.grid}>
    {children}
  </div>
)

Grid.propTypes = {
  children: PropTypes.node
}

const fractionToClassName = (frac = '') => frac.replace(/\//, 'of')

export const Span = ({children, s, m}) => {
  return (
    <div {...styles.span}
      {...styles[`s${fractionToClassName(s)}`]}
      {...styles[`m${fractionToClassName(m)}`]}>
      {children}
    </div>
  )
}

Span.propTypes = {
  children: PropTypes.node,
  s: PropTypes.oneOf(['1/2', '2/2']),
  m: PropTypes.oneOf(['1/6', '2/6', '3/6', '4/6', '5/6', '6/6'])
}
