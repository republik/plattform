import { useTheme } from 'next-themes'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { Figure } from '../Figure'

function Datawrapper({ datawrapperId, alt, size, plain = false }) {
  const chartRef = useRef()
  const [embedData, setEmbedData] = useState()
  const [scriptReady, setScriptReady] = useState(false)
  const { theme } = useTheme()

  // Datawrapper supports true/false/"auto"
  const dark = theme === 'dark' ? true : theme === 'light' ? false : 'auto'

  useEffect(() => {
    if (datawrapperId) {
      fetch(`https://datawrapper.dwcdn.net/${datawrapperId}/embed.json`)
        .then((res) => res.json())
        .then((data) => {
          setEmbedData(data)
        })
        .catch((e) => console.error(e))
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
      {datawrapperId ? null : 'Chart-ID fehlt'}
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
