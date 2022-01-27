import React from 'react'
import { css } from 'glamor'
import mergeClassNames from '../../lib/mergeClassNames'

const containerStyles = ({
  display = 'flex',
  direction = 'column',
  wrap = 'wrap',
  justifyContent = 'start'
}) =>
  css({
    display,
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent
  })

const tileStyles = ({ flex = '1 1 auto' }) =>
  css({
    flex
  })

const getRef = (Component, domRef) => {
  if (!domRef) {
    return {}
  } else if (typeof Component === 'string') {
    return { ref: domRef }
  } else {
    return {
      domRef
    }
  }
}

export const createTile = (
  flexDefaults = {},
  defaultProps = {}
) => Component => ({
  className,
  style,
  domRef,
  children,
  flex,
  ...props
}) =>
  React.createElement(
    Component,
    {
      className: mergeClassNames(
        tileStyles({ flex, ...flexDefaults }),
        className
      ),
      ...{
        style: {
          ...defaultProps.style,
          ...style
        }
      },
      ...getRef(Component, domRef),
      ...props
    },
    children
  )

export const createContainer = (
  flexDefaults = {},
  defaultProps = {}
) => Component => ({
  className,
  style,
  domRef,
  children,
  display,
  direction,
  justifyContent,
  wrap,
  ...props
}) =>
  React.createElement(
    Component,
    {
      className: mergeClassNames(
        containerStyles({
          display,
          direction,
          justifyContent,
          wrap,
          ...flexDefaults
        }),
        className
      ),
      ...{
        style: {
          ...defaultProps.style,
          ...style
        }
      },
      ...getRef(Component, domRef),
      ...props
    },
    children
  )

export const Container = createContainer()('div')
export const Tile = createTile()('div')
export const ContainerTile = createContainer()(
  createTile()('div')
)
