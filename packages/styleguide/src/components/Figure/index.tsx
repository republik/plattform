import React from 'react'
import { css, merge, keyframes } from 'glamor'

import { mUp, mUpAndPrint } from '../../theme/mediaQueries'
import {
  breakoutStyles,
  PADDED_MAX_WIDTH,
  MAX_WIDTH,
  PADDING,
  BREAKOUT_SIZES,
} from '../Center'

import { plainButtonRule } from '../Button'
import { IconAudio } from '@republik/icons'

export { default as FigureImage, MIN_GALLERY_IMG_WIDTH } from './Image'
export { default as FigureCaption } from './Caption'
export { default as FigureByline } from './Byline'

const styles = {
  figure: css({
    margin: 0,
    marginBottom: 15,
    padding: 0,
    width: '100%',
    '@media print': {
      '& img': {
        maxWidth: MAX_WIDTH / 2,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
  }),
  figureGroup: css({
    margin: 0,
    display: 'block',
    position: 'relative',
    '& noscript': {
      display: 'block',
      width: '100%',
    },
    [mUpAndPrint]: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  }),
  cover: css({
    position: 'relative',
  }),
  coverSize: css({
    marginTop: 30,
    marginBottom: 20,
  }),
  coverBreakout: css({
    margin: '30px auto 20px auto',
    maxWidth: PADDED_MAX_WIDTH,
    padding: PADDING,
    '@media print': {
      width: '50%',
      margin: '0 auto 20px auto',
    },
  }),
  coverText: css({
    position: 'absolute',
    left: '5%',
    right: '5%',
    textAlign: 'center',
    display: 'none',
    [mUp]: {
      display: 'block',
    },
  }),
  coverTextTitleBlockHeadline: css({
    display: 'block',
    [mUp]: {
      display: 'none',
    },
  }),
  coverAudio: css(plainButtonRule, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: '50%',
    marginLeft: -45,
    marginTop: -45,
    width: 90,
    height: 90,
    '& svg': {
      position: 'absolute',
      top: '25%',
      left: '25%',
      width: '50%',
      height: '50%',
    },
    [mUp]: {
      marginLeft: -75,
      marginTop: -75,
      width: 150,
      height: 150,
    },
    '@media (hover)': {
      ':hover': {
        animationIterationCount: 'infinite',
      },
    },
  }),
  col2: css({
    [mUpAndPrint]: {
      '& figure': {
        maxWidth: `calc(${100 / 2}% - 8px)`,
      },
    },
  }),
  col3: css({
    [mUpAndPrint]: {
      '& figure': {
        maxWidth: `calc(${100 / 3}% - 10px)`,
      },
    },
  }),
  col4: css({
    [mUpAndPrint]: {
      '& figure': {
        maxWidth: `calc(${100 / 4}% - 12px)`,
      },
    },
  }),
}

const figureBreakout = {
  ...breakoutStyles,
  center: css({
    maxWidth: PADDED_MAX_WIDTH,
    padding: PADDING,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0,
  }),
}

export const FIGURE_SIZES = {
  ...BREAKOUT_SIZES,
  center: MAX_WIDTH,
}

export type FigureSize = keyof typeof FIGURE_SIZES

export type FigureProps = {
  children: React.ReactNode
  size?: FigureSize
  attributes?: React.ComponentPropsWithoutRef<'figure'>
}

export const Figure = ({ children, attributes, size }: FigureProps) => (
  <figure {...attributes} {...merge(styles.figure, figureBreakout[size])}>
    {children}
  </figure>
)

const textPosStyle = ({
  anchor,
  offset,
}: {
  anchor: 'top' | 'middle' | 'bottom'
  offset?: number | string
}): React.CSSProperties => {
  if (anchor === 'middle') {
    return {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-, -50%)',
      marginTop: offset,
    }
  }
  if (anchor === 'top') {
    return {
      position: 'absolute',
      top: offset,
    }
  }
  if (anchor === 'bottom') {
    return {
      position: 'absolute',
      bottom: offset,
    }
  }
}

type CoverTextTitleBlockHeadlineProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'div'>
}

export const CoverTextTitleBlockHeadline = ({
  children,
  attributes,
}: CoverTextTitleBlockHeadlineProps) => (
  <div {...attributes} {...styles.coverTextTitleBlockHeadline}>
    {children}
  </div>
)

type AudioButtonProps<T = unknown> = {
  color: string
  backgroundColor: string
  onClick: (_: T) => void
  meta: T
}

const AudioButton = <T,>({
  color,
  backgroundColor,
  onClick,
  meta,
}: AudioButtonProps<T>) => {
  const pulse = keyframes({
    '0%': { boxShadow: `0 0 0 0 ${backgroundColor}` },
    '70%': { boxShadow: `0 0 0 10px transparent` },
    '100%': { boxShadow: `0 0 0 0 transparent` },
  })

  return (
    <button
      {...styles.coverAudio}
      onClick={() => {
        onClick(meta)
      }}
      style={{
        color,
        backgroundColor,
      }}
      {...css({
        animation: `${pulse} 2s 3`,
      })}
    >
      <IconAudio />
    </button>
  )
}

type FigureCoverProps = {
  text: {
    element: React.ReactNode
    anchor: 'top' | 'middle' | 'bottom'
  }
  audio?: AudioButtonProps
} & FigureProps

export const FigureCover = ({
  size,
  text,
  audio,
  ...props
}: FigureCoverProps) => {
  const sizeStyle = size
    ? size === 'breakout'
      ? styles.coverBreakout
      : styles.coverSize
    : undefined
  return (
    <div {...styles.cover} {...sizeStyle}>
      <Figure size={size} {...props} />
      {text && (
        <div style={textPosStyle(text)} {...styles.coverText}>
          {text.element}
        </div>
      )}
      {audio && <AudioButton {...audio} />}
    </div>
  )
}

type FigureGroupProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'figure'>
  columns?: 1 | 2 | 3 | 4
  size?: keyof typeof FIGURE_SIZES
  data?: unknown
}

export const FigureGroup = ({
  children,
  attributes,
  columns = 2,
  size,
}: FigureGroupProps) => {
  return (
    <figure
      role='group'
      {...attributes}
      {...merge(styles.figureGroup, breakoutStyles[size])}
      {...styles[`col${columns}`]}
    >
      {children}
    </figure>
  )
}
