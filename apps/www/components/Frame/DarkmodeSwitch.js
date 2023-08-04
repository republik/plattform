import { forwardRef } from 'react'
import { CalloutMenu, IconButton, Radio } from '@project-r/styleguide'
import { useInNativeApp } from '../../lib/withInNativeApp'

import { IconDarkMode } from '@republik/icons'
import { useTheme } from 'next-themes'

const DarkmodeSwitch = ({ t }) => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const { theme, setTheme } = useTheme()

  const iconLabel =
    theme === 'light'
      ? t('darkmode/switch/off')
      : theme === 'dark'
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
              checked={theme === 'dark'}
              onChange={() => {
                setTheme('dark')
              }}
            >
              {t('darkmode/switch/on')}
            </Radio>
            <br />
            <Radio
              value='light'
              checked={theme === 'light'}
              onChange={() => {
                setTheme(inNativeAppLegacy ? '' : 'light')
              }}
            >
              {t('darkmode/switch/off')}
            </Radio>
            <br />
            {!inNativeAppLegacy && (
              <Radio
                value='auto'
                checked={theme === 'system'}
                onChange={() => {
                  setTheme('system')
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
