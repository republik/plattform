import { css } from 'glamor'
import React from 'react'
import { fontStyles } from '../../theme/fonts'
import CarouselContext from './Context'

const styles = {
  base: css({
    margin: '0 0 10px 0',
  }),
  editorial: css({
    ...fontStyles.serifTitle,
    fontSize: 19,
    lineHeight: '22px',
  }),
  interaction: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 19,
    lineHeight: '22px',
  }),
  scribble: css({
    ...fontStyles.cursiveTitle,
    fontSize: 19,
    lineHeight: '22px',
  }),
  bigger: css({ fontSize: 28, lineHeight: '28px' }),
}

type EditorialProps = {
  children: React.ReactNode
  bigger?: boolean
}

export const Editorial = ({
  children,
  bigger: biggerProp = false,
}: EditorialProps) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.editorial,
    bigger && styles.bigger,
  )

  return <h1 {...headlineStyles}>{children}</h1>
}

type InteractionProps = {
  children: React.ReactNode
  bigger?: boolean
}

export const Interaction = ({
  children,
  bigger: biggerProp = false,
}: InteractionProps) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.interaction,
    bigger && styles.bigger,
  )
  return <h1 {...headlineStyles}>{children}</h1>
}

type ScribbleProps = {
  children: React.ReactNode
  bigger?: boolean
}

export const Scribble = ({
  children,
  bigger: biggerProp = false,
}: ScribbleProps) => {
  const context = React.useContext(CarouselContext)
  const bigger = biggerProp || context.bigger

  const headlineStyles = css(
    styles.base,
    styles.scribble,
    bigger && styles.bigger,
  )
  return <h1 {...headlineStyles}>{children}</h1>
}
