import { css } from 'glamor'
import React from 'react'
import { sansSerifMedium16 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'

const ICON_SIZE = 29

type IconProps = React.ComponentPropsWithoutRef<'svg'> & {
  size: number
  fill?: string
}

const Icon = ({ size, fill, ...props }: IconProps) => (
  <svg
    {...styles.icon}
    width={`${size}px`}
    height={`${size}px`}
    viewBox={`0 0 30 30`}
    {...props}
  >
    <path
      d='M26.9642857,0 L8.75,0 C7.08035714,0 5.71428571,1.36607143 5.71428571,3.03571429 L5.71428571,21.25 C5.71428571,22.9196429 7.08035714,24.2857143 8.75,24.2857143 L26.9642857,24.2857143 C28.6339286,24.2857143 30,22.9196429 30,21.25 L30,3.03571429 C30,1.36607143 28.6339286,0 26.9642857,0 Z'
      fill={fill}
    />
    <path
      d='M3.03571429,5.71428571 L0,5.71428571 L0,26.9642857 C0,28.6339286 1.36607143,30 3.03571429,30 L24.2857143,30 L24.2857143,26.9642857 L3.03571429,26.9642857 L3.03571429,5.71428571 Z'
      fill={fill}
    />
  </svg>
)

const styles = {
  container: css({
    margin: '0 10px',
    position: 'relative',
    width: ICON_SIZE,
    height: ICON_SIZE,
  }),
  icon: css({
    position: 'absolute',
    top: 0,
    left: 0,
  }),
  count: css({
    position: 'absolute',
    top: -1,
    left: 0,
    paddingLeft: 6,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...sansSerifMedium16,
  }),
}

type ArticleCountProps = {
  count: number
  bgColor: string
  color: string
}

const ArticleCount = ({
  count,
  bgColor,
  color: textColor,
}: ArticleCountProps) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container}>
      <Icon size={ICON_SIZE} {...colorScheme.set('fill', bgColor)} />
      <span {...styles.count} {...colorScheme.set('color', textColor)}>
        {count}
      </span>
    </div>
  )
}

export default ArticleCount
