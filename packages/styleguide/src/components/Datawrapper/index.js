import React, { useEffect, useRef } from 'react'
import Script from 'next/script'

function Datawrapper({ datawrapperId, alt }) {
  const chartRef = useRef()

  useEffect(() => {
    if (datawrapperId) {
      fetch(`https://datawrapper.dwcdn.net/${datawrapperId}/embed.json`)
        .then((res) => res.json())
        .then((embedData) => {
          // then pass it to datawrapper.render call, along with { target, flags }

          if (chartRef.current) {
            window.datawrapper?.render(embedData, {
              // the node that will be turned into the web component
              target: chartRef.current,
              // optionally include flags (e.g dark, fitchart) here
              // see https://developer.datawrapper.de/docs/render-flags
              flags: {},
            })
          }
        })
        .catch((e) => console.error(e))
    }
  }, [datawrapperId])

  return (
    <div>
      {datawrapperId ? null : 'Chart-ID fehlt'}
      <div ref={chartRef}></div>
      <Script src={`https://datawrapper.dwcdn.net/lib/datawrapper.js`} />
    </div>
  )
}

export default Datawrapper
