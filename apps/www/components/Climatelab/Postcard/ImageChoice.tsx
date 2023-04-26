import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import AssetImage from '../../../lib/images/AssetImage'

import { climateColors } from '../config'

const styles = {
  '& img': css({ display: 'block' }),
  image: css({
    cursor: 'pointer',
    borderWidth: '3px',
    borderStyle: 'solid',
    maxWidth: '100%',
    borderRadius: '2px',
    transition: 'box-shadow 0.3s ease-out, border-color 0.2s ease-out',
    ':hover': {
      cursor: 'pointer',
      outline: 'none',
    },
    '> span': { display: 'block !important' },
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

const BackgroundImage = ({
  checked,
  disabled,
  imageUrl,
}: Pick<ImageChoiceProps, 'checked' | 'disabled' | 'imageUrl'>) => {
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
    <div
      {...styles.image}
      {...hoverRule}
      {...colorScheme.set(
        'borderColor',
        checked ? climateColors.light.default : '#FFF',
      )}
      {...(disabled ? styles.disabledImage : undefined)}
      {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
    >
      <AssetImage
        alt='Klimalabor Postkarte'
        width={600}
        height={420}
        src={imageUrl}
      />
    </div>
  )
}

type ImageChoiceProps = {
  style?: React.CSSProperties
  name?: string
  imageUrl?: string
  value: string
  checked: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ImageChoice: React.FC<ImageChoiceProps> = ({
  style,
  name,
  value,
  checked,
  disabled,
  imageUrl,
  onChange,
}) => {
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
