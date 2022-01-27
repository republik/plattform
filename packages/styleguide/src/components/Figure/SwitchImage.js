import React from 'react'
import { useColorContext } from '../Colors/useColorContext'

const SwitchImage = ({ src, srcSet, dark, alt, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <>
      <img
        {...props}
        src={src}
        srcSet={srcSet}
        alt={alt}
        {...colorScheme.set('display', dark ? 'displayLight' : 'block')}
      />
      {dark && (
        <img
          {...props}
          src={dark.src}
          srcSet={dark.srcSet}
          alt={alt}
          {...colorScheme.set('display', 'displayDark')}
        />
      )}
    </>
  )
}

export default SwitchImage
