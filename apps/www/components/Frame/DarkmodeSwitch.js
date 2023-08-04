import { forwardRef } from 'react'
import { CalloutMenu, IconButton, Radio } from '@project-r/styleguide'
import { useInNativeApp } from '../../lib/withInNativeApp'

import { useColorSchemePreference } from '../ColorScheme/useColorScheme'
import { IconDarkMode } from '@republik/icons'

const DarkmodeSwitch = ({ t }) => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const [colorSchemeKey, setColorSchemeKey] = useColorSchemePreference()

  const iconLabel =
    colorSchemeKey === 'light'
      ? t('darkmode/switch/off')
      : colorSchemeKey === 'dark'
      ? t('darkmode/switch/on')
      : t('darkmode/switch/auto')

  const Icon = forwardRef((props, ref) => (
    <IconButton
      Icon={IconDarkMode}
      label={t('darkmode/switch/label', {
        iconLabel,
      })}
      labelShort={t('darkmode/switch/label', {
        iconLabel,
      })}
      ref={ref}
      {...props}
    />
  ))

  const calloutPaddingNativeApp = inNativeApp
    ? '15px 15px 25px'
    : '15px 15px 50px'

  return (
    <CalloutMenu contentPaddingMobile={calloutPaddingNativeApp} Element={Icon}>
      <div style={{ width: 180, lineHeight: '2.5rem' }}>
        {
          <>
            <Radio
              value='dark'
              checked={colorSchemeKey === 'dark'}
              onChange={() => {
                setColorSchemeKey('dark')
              }}
            >
              {t('darkmode/switch/on')}
            </Radio>
            <br />
            <Radio
              value='light'
              checked={colorSchemeKey === 'light'}
              onChange={() => {
                setColorSchemeKey(inNativeAppLegacy ? '' : 'light')
              }}
            >
              {t('darkmode/switch/off')}
            </Radio>
            <br />
            {!inNativeAppLegacy && (
              <Radio
                value='auto'
                checked={colorSchemeKey === 'auto'}
                onChange={() => {
                  setColorSchemeKey('auto')
                }}
              >
                {t('darkmode/switch/auto')}
              </Radio>
            )}
          </>
        }
      </div>
    </CalloutMenu>
  )
}

export default DarkmodeSwitch
