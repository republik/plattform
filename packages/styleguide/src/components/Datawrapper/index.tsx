import { useTheme } from 'next-themes'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { Figure, FigureSize } from '../Figure'

declare global {
  interface Window {
    datawrapper: any | undefined
  }
}

function Datawrapper({
  datawrapperId,
  forceDark = false,
  size,
  plain = false,
}: {
  datawrapperId: string
  size: FigureSize
  forceDark?: boolean
  plain?: boolean
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
    <Figure size={size}>
      {idMissing ? (
        <div
          style={{
            color: 'var(--color-error)',
            padding: 15,
          }}
        >
          Chart-ID fehlt
        </div>
      ) : error ? (
        <div
          style={{
            color: 'var(--color-error)',
            padding: 15,
          }}
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
    </Figure>
  )
}

export default Datawrapper
