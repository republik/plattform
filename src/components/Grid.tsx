import * as React from 'react'
import { css, StyleAttribute } from 'glamor'

const gridBasicStyles: StyleAttribute = css({
  display: 'flex'
})

const rowStyles = css({
  flexDirection: 'row'
})

const columnStyles = css({
  flexDirection: 'column'
})

export interface GridProps {
  [key: string]: any
  className?: string
  flexFlow?: string
  justifyContent?: string
  flex?: string
  as?: string | any
}

export const Tile: React.SFC<
  GridProps & {
    children: any
  }
> = ({
  className,
  flexFlow,
  justifyContent,
  flex,
  children,
  as,
  ...props
}) => {
  const tileStyles = css({
    justifyContent,
    flex,
    flexFlow
  })
  return React.createElement(
    as,
    {
      ...{
        className: `${gridBasicStyles} ${tileStyles}`.concat(
          className ? ` ${className}` : ''
        )
      },
      ...props
    },
    children
  )
}

Tile.defaultProps = {
  as: 'div'
}

export const Row: React.SFC<
  GridProps & {
    children: any
  }
> = ({ className, children, ...props }) => {
  return (
    <Tile
      className={`${rowStyles} ${className}`}
      {...props}
    >
      {children}
    </Tile>
  )
}

export const Column: React.SFC<
  GridProps & {
    children: any
  }
> = ({ className, children, ...props }) => {
  return (
    <Tile
      className={`${columnStyles} ${className}`}
      {...props}
    >
      {children}
    </Tile>
  )
}
