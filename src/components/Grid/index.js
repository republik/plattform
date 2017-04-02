import React, {PropTypes} from 'react'
import {css} from 'glamor'
import {onlyS, mUp} from '../../theme/mediaQueries'

export const GUTTER = 42
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
    paddingRight: `${GUTTER / 2}px`,
    minHeight: 1
  }),
  s1of2: css({[onlyS]: {width: '50%'}}),
  s2of2: css({[onlyS]: {width: '100%'}}),
  m1of18: css({[mUp]: {width: `${100 / 18 * 1}%`}}),
  m2of18: css({[mUp]: {width: `${100 / 18 * 2}%`}}),
  m3of18: css({[mUp]: {width: `${100 / 18 * 3}%`}}),
  m4of18: css({[mUp]: {width: `${100 / 18 * 4}%`}}),
  m5of18: css({[mUp]: {width: `${100 / 18 * 5}%`}}),
  m6of18: css({[mUp]: {width: `${100 / 18 * 6}%`}}),
  m7of18: css({[mUp]: {width: `${100 / 18 * 7}%`}}),
  m8of18: css({[mUp]: {width: `${100 / 18 * 8}%`}}),
  m9of18: css({[mUp]: {width: `${100 / 18 * 9}%`}}),
  m10of18: css({[mUp]: {width: `${100 / 18 * 10}%`}}),
  m11of18: css({[mUp]: {width: `${100 / 18 * 11}%`}}),
  m12of18: css({[mUp]: {width: `${100 / 18 * 12}%`}}),
  m13of18: css({[mUp]: {width: `${100 / 18 * 13}%`}}),
  m14of18: css({[mUp]: {width: `${100 / 18 * 14}%`}}),
  m15of18: css({[mUp]: {width: `${100 / 18 * 15}%`}}),
  m16of18: css({[mUp]: {width: `${100 / 18 * 16}%`}}),
  m17of18: css({[mUp]: {width: `${100 / 18 * 17}%`}}),
  m18of18: css({[mUp]: {width: `${100 / 18 * 18}%`}})
}

export const Container = ({children, ...props}) => (
  <div {...props} {...styles.container}>
    {children}
  </div>
)

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.any
}

export const NarrowContainer = ({children, ...props}) => (
  <div {...props} {...styles.narrowContainer}>
    {children}
  </div>
)

NarrowContainer.propTypes = {
  children: PropTypes.node
}

export const MediumContainer = ({children, ...props}) => (
  <div {...props} {...styles.mediumContainer}>
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

export const Span = ({children, style, s, m}) => {
  return (
    <div style={style} {...styles.span}
      {...styles[`s${fractionToClassName(s)}`]}
      {...styles[`m${fractionToClassName(m)}`]}>
      {children}
    </div>
  )
}

Span.propTypes = {
  children: PropTypes.node,
  s: PropTypes.oneOf(['1/2', '2/2']),
  m: PropTypes.oneOf([
    '1/18', '2/18', '3/18', '4/18', '5/18', '6/18', '7/18', '8/18', '9/18',
    '10/18', '11/18', '12/18', '13/18', '14/18', '15/18', '16/18', '17/18', '18/18'
  ])
}

Span.defaultProps = {
  s: '2/2',
  m: '6/6'
}
