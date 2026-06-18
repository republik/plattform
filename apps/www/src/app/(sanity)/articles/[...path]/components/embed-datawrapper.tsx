'use client'
import { useTheme } from 'next-themes'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { css, cva, cx } from '@republik/theme/css'
import type { EmbedDataWrapper } from '@/sanity.types'

declare global {
  interface Window {
    datawrapper: any | undefined
  }
}

const figureStyle = cva({
  base: {
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
        '& > figcaption': {
          ml: '4',
        },
      },
    },
  },
})

const styles = {
  hidePrint: css({
    '@media print': {
      display: 'none',
    },
  }),
  showPrint: css({
    display: 'none',
    '@media print': {
      display: 'block',
    },
  }),
}

function DataWrapperInteractive({
  value: { datawrapperId, forceDark = false, size, plain = false },
}: {
  value: EmbedDataWrapper
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [embedData, setEmbedData] = useState<
    Record<string, string | number> | undefined
  >()
  const [error, setError] = useState<string>()
  const [scriptReady, setScriptReady] = useState(false)
  const { theme: themeSetting, forcedTheme } = useTheme()

  const theme = forcedTheme ?? themeSetting

  const idMissing = !datawrapperId

  // Datawrapper supports true/false/"auto"
  const dark =
    forceDark || (theme === 'dark' ? true : theme === 'light' ? false : 'auto')

  useEffect(() => {
    setError(undefined)
    const target = chartRef.current
    if (target) {
      // Remove all children of the target because datawrapper.render() will just append more
      while (target.firstChild) {
        target.removeChild(target.firstChild)
      }
    }
    if (datawrapperId) {
      fetch(`https://datawrapper.dwcdn.net/${datawrapperId}/embed.json`)
        .then((res) => res.json())
        .then((data) => {
          setEmbedData(data)
        })
        .catch((e) => {
          setError('Grafik konnte nicht geladen werden')
          console.error(e)
        })
    }
  }, [datawrapperId])

  useEffect(() => {
    const target = chartRef.current

    if (embedData && target && scriptReady) {
      // Remove all children of the target because datawrapper.render() will just append more
      while (target.firstChild) {
        target.removeChild(target.firstChild)
      }

      window.datawrapper?.render(embedData, {
        // the node that will be turned into the web component
        target,
        // optionally include flags (e.g dark, fitchart) here
        // see https://developer.datawrapper.de/docs/render-flags
        flags: { dark, plain },
      })
    }
  }, [embedData, plain, scriptReady, dark])

  return (
    <figure className={cx(figureStyle({ size }), styles.hidePrint)}>
      {idMissing ? (
        <div
          className={css({
            color: 'error',
            p: '4',
          })}
        >
          Chart-ID fehlt
        </div>
      ) : error ? (
        <div
          className={css({
            color: 'error',
            p: '4',
          })}
        >
          {error}
        </div>
      ) : null}
      <div ref={chartRef} style={{ minHeight: 10 }}></div>
      <Script
        id='datawrapper-lib'
        src='https://datawrapper.dwcdn.net/lib/datawrapper.js'
        onReady={() => {
          setScriptReady(true)
        }}
        // Not sure why but onReady isn't always called, so we also use onLoad
        onLoad={() => {
          setScriptReady(true)
        }}
      />
    </figure>
  )
}

// We use the image instead of the interactive chart for the pdf version
// https://datawrapper.dwcdn.net/DW123ID/full.png -> 600px wide
function DataWrapperPrint({ datawrapperId }: { datawrapperId: string }) {
  return (
    <figure className={styles.showPrint}>
      <img
        width={600}
        src={`https://datawrapper.dwcdn.net/${datawrapperId}/full.png`}
      />
    </figure>
  )
}

export function EmbedDataWrapper({ value }: { value: EmbedDataWrapper }) {
  return (
    <>
      <DataWrapperInteractive value={value} />
      <DataWrapperPrint datawrapperId={value.datawrapperId} />
    </>
  )
}
