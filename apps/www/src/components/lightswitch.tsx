'use client'

import { css } from '@app/styled-system/css'
import { IconComputer, IconLightMode, IconDarkMode } from '@republik/icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function LightSwitch() {
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(null)

  useEffect(() => {
    setCurrentTheme(theme)
  }, [theme, setCurrentTheme])

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: 'textSoft',
        transition: 'all 0.2s ease',
        backgroundColor: 'transparent',
        maxWidth: 'max-content',
        '&:hover': {
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
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
            '&:hover': {
              color: 'text',
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
            '&[aria-checked="true"]': {
              color: 'text',
            },
          })}
          role='radio'
          aria-checked={currentTheme === theme}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
