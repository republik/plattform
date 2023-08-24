import React from 'react'
import { css } from 'glamor'

const styles = {
  visibleAlways: css({ display: 'block' }),
  visibleLight: css({
    display: 'var(--color-displayLight)',
  }),
  visibleDark: css({ display: 'var(--color-displayDark)' }),
}

type SwitchImageProps = {
  src: string
  srcSet?: string
  dark?: {
    src: string
    srcSet?: string
  }
  alt?: string
  maxWidth?: number
} & React.ComponentPropsWithoutRef<'img'>

const SwitchImage = ({
  src,
  srcSet,
  dark,
  alt,
  maxWidth,
  ...props
}: SwitchImageProps) => {
  return (
    <>
      <img
        {...props}
        src={src}
        srcSet={srcSet}
        alt={alt}
        {...(dark ? styles.visibleLight : styles.visibleAlways)}
      />
      {dark && (
        <img
          {...props}
          src={dark.src}
          srcSet={dark.srcSet}
          alt={alt}
          {...styles.visibleDark}
        />
      )}
    </>
  )
}

export default SwitchImage
