import React, { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Figure } from '../Figure'

function Datawrapper({ datawrapperId, alt, size }) {
  const chartRef = useRef()
  const [embedData, setEmbedData] = useState()

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
    if (embedData && chartRef.current) {
      window.datawrapper?.render(embedData, {
        // the node that will be turned into the web component
        target: chartRef.current,
        // optionally include flags (e.g dark, fitchart) here
        // see https://developer.datawrapper.de/docs/render-flags
        flags: { dark: 'auto' },
      })
    }
  }, [embedData])

  return (
    <Figure size={size}>
      {datawrapperId ? null : 'Chart-ID fehlt'}
      <div data-dw-id={datawrapperId} ref={chartRef}></div>
      <Script src={`https://datawrapper.dwcdn.net/lib/datawrapper.js`} />
    </Figure>
  )
}

export default Datawrapper
