import { useEffect } from 'react'
import { COLOR_SCHEME_KEY, OS_COLOR_SCHEME_KEY, useColorSchemeKey } from './lib'
import NextHead from 'next/head'
import Script from 'next/script'

const ColorSchemeSync = () => {
  const { key: colorSchemeKey, defaultKey } = useColorSchemeKey()

  const setColorSchemeKey = (key) => {
    if (key && key !== 'auto') {
      document.documentElement.setAttribute('data-user-color-scheme', key)
    } else {
      document.documentElement.removeAttribute('data-user-color-scheme')
    }
  }

  useEffect(() => {
    setColorSchemeKey(colorSchemeKey)
  }, [colorSchemeKey])
  useEffect(() => {
    return () => {
      // removeAttribute when unmounted
      setColorSchemeKey()
    }
  }, [])
  return (
    <NextHead>
      <Script
        id='color-scheme-sync-script'
        strategy='beforeInteractive'
        dangerouslySetInnerHTML={{
          __html: [
            'var key;try{',
            `key=JSON.parse(localStorage.getItem('${COLOR_SCHEME_KEY}'))`,
            '}catch(e){}',
            `key=key||'${defaultKey}';`,
            `if(key==='auto'){try{`,
            `key=JSON.parse(localStorage.getItem('${OS_COLOR_SCHEME_KEY}'))`,
            `}catch(e){}}`,
            `if(key!=='auto'){document.documentElement.setAttribute('data-user-color-scheme', key)}`,
          ].join(''),
        }}
      />
    </NextHead>
  )
}

export default ColorSchemeSync
