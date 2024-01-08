'use client'

import { plainButtonRule, useColorContext } from '@project-r/styleguide'
import { IconComputer, IconLightMode, IconDarkMode } from '@republik/icons'
import { css } from 'glamor'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * This component is a duplicate of src/app/components/lightswitch.js for the while, while both glamor & panda-css are in use.
 */
export default function LightSwitch() {
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(null)
  const [colorScheme] = useColorContext()

  useEffect(() => {
    setCurrentTheme(theme)
  }, [theme, setCurrentTheme])

  return (
    <div
      {...css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: colorScheme.getCSSColor('textSoft'),
        transition: 'all 0.2s ease',
        backgroundColor: 'transparent',
        maxWidth: 'max-content',
        '&:hover': {
          color: colorScheme.getCSSColor('text'),
          borderRadius: '9999px',
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
      })}
      role='radiogroup'
    >
      {[
        {
          Icon: IconComputer,
          theme: 'system',
        },
        {
          Icon: IconLightMode,
          theme: 'light',
        },
        {
          Icon: IconDarkMode,
          theme: 'dark',
        },
      ].map(({ theme, Icon }) => (
        <button
          key={theme}
          onClick={() => setTheme(theme)}
          {...plainButtonRule}
          {...css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            backgroundColor: 'transparent',
            color: colorScheme.getCSSColor('textSoft'),
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              colorScheme: colorScheme.getCSSColor('text'),
            },
            '&[aria-checked="true"]': {
              color: colorScheme.getCSSColor('text'),
            },
          })}
          role='radio'
          aria-checked={currentTheme === theme}
        >
          <Icon aria-description={`Theme: ${currentTheme}`} />
        </button>
      ))}
    </div>
  )
}
