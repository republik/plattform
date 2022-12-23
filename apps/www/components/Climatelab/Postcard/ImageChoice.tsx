import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

const styles = {
  image: css({
    cursor: 'pointer',
    borderWidth: '3px',
    borderStyle: 'solid',
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '2px',
    transition: 'box-shadow 0.3s ease-out',
    ':hover': {
      cursor: 'pointer',
      outline: 'none',
    },
  }),
  input: css({
    cursor: 'pointer',
    // hidden but accessible
    // https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    opacity: 0,
  }),
  disabledImage: css({
    filter: 'grayscale(100%)',
  }),
}

const BackgroundImage = ({ checked, disabled, imageUrl }) => {
  const [colorScheme] = useColorContext()
  const hoverRule = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            boxShadow: colorScheme.getCSSColor('imageChoiceShadowHover'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <img
      {...styles.image}
      {...hoverRule}
      {...colorScheme.set('borderColor', checked ? '#6f38b1' : '#FFF')}
      {...(disabled ? styles.disabledImage : undefined)}
      src={imageUrl}
      {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
    />
  )
}

const ImageChoice: React.FC<{
  style?: React.CSSProperties
  name?: string
  imageUrl?: string
  value: string
  checked: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ style, name, value, checked, disabled, imageUrl, onChange }) => {
  return (
    <label style={style}>
      <input
        {...styles.input}
        name={name}
        type='radio'
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <BackgroundImage
        imageUrl={imageUrl}
        checked={checked}
        disabled={disabled}
      />
    </label>
  )
}

export default ImageChoice
