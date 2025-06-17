import { css, keyframes } from 'glamor'

const containerStyle = css({
  display: 'block',
  position: 'absolute',
  top: '50%',
  left: '50%',
})
const spin = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0.15 },
})
const barStyle = css({
  display: 'block',
  animation: `${spin} 1.2s linear infinite`,
  borderRadius: 5,
  backgroundColor: '#999',
  position: 'absolute',
  width: '20%',
  height: '7.8%',
  top: '-3.9%',
  left: '-10%',
})

/**
 * SpinnerProps
 *
 * @typedef {object} SpinnerProps
 * @property {number | string} size
 */

/**
 * Spinner component
 * @param {SpinnerProps} props
 * @returns {JSX.Element}
 */
const Spinner = ({ size = 50 }) => {
  const bars = []
  for (let i = 0; i < 12; i++) {
    const style = {}
    style.WebkitAnimationDelay = style.animationDelay = (i - 12) / 10 + 's'
    style.WebkitTransform = style.transform =
      'rotate(' + i * 30 + 'deg) translate(146%)'

    bars.push(<span {...barStyle} style={style} key={i} />)
  }

  return (
    <span {...containerStyle} style={{ width: size, height: size }}>
      {bars}
    </span>
  )
}

const inlineBlock = css({
  position: 'relative',
  display: 'inline-block',
})

/**
 * Spinner component
 * @param {SpinnerProps} props
 * @returns {JSX.Element}
 */
export const InlineSpinner = ({ size }) => (
  <span {...inlineBlock} style={{ width: size, height: size }}>
    <Spinner size={size} />
  </span>
)

export default Spinner
