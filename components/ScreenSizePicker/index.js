import React from 'react'
import { css } from 'glamor'
import {
  plainButtonRule,
  fontStyles,
  useColorContext,
  Checkbox,
  Interaction,
  colors
} from '@project-r/styleguide'

import MdPhoneIphone from 'react-icons/lib/md/phone-iphone'
import MdTabletMac from 'react-icons/lib/md/tablet-mac'
import MdLaptopMac from 'react-icons/lib/md/laptop-mac'
import MdDesktopMac from 'react-icons/lib/md/desktop-mac'

const styles = {
  container: css({
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap'
  }),
  iconContainer: css({
    flex: '0 0 30%',
    minWidth: 80,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }),
  label: css({
    ...fontStyles.sansSerifRegular12,
    marginTop: 4
  }),
  divider: css({
    borderBottom: `1px solid ${colors.divider}`,
    margin: '16px 0'
  })
}

const screenSizes = [
  {
    name: 'phone',
    label: 'Mobile',
    Icon: MdPhoneIphone
  },
  {
    name: 'tablet',
    label: 'Tablet',
    Icon: MdTabletMac
  },
  {
    name: 'laptop',
    label: 'Laptop',
    Icon: MdLaptopMac
  },
  {
    name: 'desktop',
    label: 'Desktop',
    Icon: MdDesktopMac
  }
]

const ScreenSizePicker = ({
  onSelect,
  selectedScreenSize,
  onDarkmodeToggle,
  previewDarkmode
}) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      <Interaction.P style={{ marginBottom: 16 }}>Vorschau</Interaction.P>
      <div {...styles.container}>
        {screenSizes.map(size => {
          const isSelected = selectedScreenSize === size.name
          return (
            <button
              key={size.name}
              {...colorScheme.set(
                'backgroundColor',
                isSelected ? 'text' : 'default'
              )}
              {...styles.iconContainer}
              {...plainButtonRule}
              onClick={() => onSelect(size.name)}
            >
              <size.Icon
                {...colorScheme.set('fill', isSelected ? 'default' : 'text')}
                size={24}
              />
              <span
                {...colorScheme.set('color', isSelected ? 'default' : 'text')}
                {...styles.label}
              >
                {size.label}
              </span>
            </button>
          )
        })}
      </div>
      <div {...styles.divider} />
      {selectedScreenSize ? (
        <>
          <Interaction.P style={{ marginBottom: 16 }}>Nachtmodus</Interaction.P>
          <Checkbox
            black
            checked={previewDarkmode}
            onChange={() => onDarkmodeToggle()}
          >
            {previewDarkmode ? 'Aktiv' : 'Aus'}
          </Checkbox>
        </>
      ) : null}
    </>
  )
}

export default ScreenSizePicker
