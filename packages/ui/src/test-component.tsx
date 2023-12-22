import { css } from '#styled-system/css'
import { hstack, vstack } from '#styled-system/patterns'

export const TestComponent = () => {
  return (
    <div
      className={hstack({
        gap: '8',
        fontSize: '3xl',
        fontFamily: 'republikSerif',
        fontWeight: 'bold',
        color: '#ff9662',
        textTransform: 'lowercase',
      })}
    >
      <span>TEST</span>
      <span>TEST</span>
      <span>TEST</span>
    </div>
  )
}
