import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import mergeClassNames from '../../lib/mergeClassNames'

interface BasicProps extends React.Attributes {
  [key: string]: any
  domRef?: (ref: Element) => void
  className?: string | StyleAttribute
}

interface ContainerProps {
  display?: string
  direction?: string
  wrap?: string
  justifyContent?: string
}

interface TileProps {
  flex?: string
}

const containerStyles = ({
  display = 'flex',
  direction = 'column',
  wrap = 'wrap',
  justifyContent = 'start'
}: ContainerProps): StyleAttribute =>
  css({
    display,
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent
  })

const tileStyles = ({
  flex = '1 1 auto'
}: TileProps): StyleAttribute =>
  css({
    flex
  })

const getRef = (
  Component: any,
  domRef?: (ref: Element) => void
) => {
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
  flexDefaults: TileProps = {},
  defaultProps: BasicProps = {}
) => (
  Component: any
): React.SFC<TileProps & BasicProps> => ({
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
  flexDefaults: ContainerProps = {},
  defaultProps: BasicProps = {}
) => (
  Component: any
): React.SFC<ContainerProps & BasicProps> => ({
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
