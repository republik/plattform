import React, { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

function Datawrapper({ datawrapperId, alt }) {
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
        flags: {},
      })
    }
  }, [embedData])

  return (
    <div style={{ marginBottom: 30 }}>
      {datawrapperId ? null : 'Chart-ID fehlt'}
      <div ref={chartRef}></div>
      <Script src={`https://datawrapper.dwcdn.net/lib/datawrapper.js`} />
    </div>
  )
}

export default Datawrapper
