import { css } from 'glamor'
import { useTheme } from 'next-themes'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

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

function StoryComponent({ name, props }: { name: string; props: React.props }) {
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
    <>
      <my-counter></my-counter>
      <Script
        src='https://story.preview.republik.love/story-components/examples-vanilla-web-component/dist'
        onReady={() => {
          setScriptReady(true)
        }}
        // Not sure why but onReady isn't always called, so we also use onLoad
        onLoad={() => {
          setScriptReady(true)
        }}
      />
    </>
  )
}

export default StoryComponent
