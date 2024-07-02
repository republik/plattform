import React from 'react'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'

export const MAX_WIDTH_PERCENT = 70

const styles = {
  root: css({
    margin: 0,
  }),
  textContainer: css({
    margin: '0 auto',
    padding: '15px 15px 40px 15px',
    [mUp]: {
      maxWidth: `${MAX_WIDTH_PERCENT}%`,
      padding: '60px 0 80px 0',
    },
    [tUp]: {
      padding: '80px 0 100px 0',
    },
  }),
}

/**
 * @typedef {object} TypoBlockProps
 * @property {React.ReactNode} children
 * @property {object} [attributes]
 * @property {() => void} [onClick]
 * @property {string} [color]
 * @property {string} [bgColor]
 */

/**
 * TypoBlock component
 * @param {TypoBlockProps} props
 * @returns {JSX.Element}
 */
const TypoBlock = ({
  children,
  attributes,
  onClick,
  color,
  bgColor,
  audioPlayButton,
}) => {
  const background = bgColor || ''
  return (
    <div
      {...attributes}
      {...styles.root}
      onClick={onClick}
      style={{
        background,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div {...styles.textContainer}>
        <Text center color={color} audioPlayButton={audioPlayButton}>
          {children}
        </Text>
      </div>
    </div>
  )
}

export default TypoBlock
