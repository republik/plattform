import React from 'react'


const Datawrapper = ({ datawrapperId, alt }) => {
  if (!datawrapperId) {
    return <p>No Datawrapper ID</p>
  }

  const html = `<div style="min-height:496px" id="datawrapper-vis-${datawrapperId}">
      <script 
        type="text/javascript" 
        defer 
        src="https://datawrapper.dwcdn.net/${datawrapperId}/embed.js" 
        charset="utf-8"
        data-target="#datawrapper-vis-${datawrapperId}">
      </script>
      <noscript>
        <img src="https://datawrapper.dwcdn.net/${datawrapperId}/full.png" alt="${alt}" />
      </noscript>
    </div>`

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  )
}

export default Datawrapper
