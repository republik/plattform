import { useTheme } from 'next-themes'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { Figure, FigureSize } from '../Figure'
import FigureImage from '../Figure/Image'
import { css } from 'glamor'
import { MAX_WIDTH } from '../Center'

declare global {
  interface Window {
    datawrapper: any | undefined
  }
}

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

function DatawrapperInteractive({
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

// We use the image instead of the interactive chart for the pdf version
// https://datawrapper.dwcdn.net/DW123ID/full.png -> 600px wide
function DatawrapperPrint({ datawrapperId }: { datawrapperId: string }) {
  return (
    <figure>
      <img
        width={600}
        src={`https://datawrapper.dwcdn.net/${datawrapperId}/full.png`}
      />
    </figure>
  )
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
  return (
    <>
      <div {...styles.hidePrint}>
        <DatawrapperInteractive
          datawrapperId={datawrapperId}
          forceDark={forceDark}
          size={size}
          plain={plain}
        />
      </div>
      <div {...styles.showPrint}>
        <DatawrapperPrint datawrapperId={datawrapperId} />
      </div>
    </>
  )
}

export default Datawrapper
