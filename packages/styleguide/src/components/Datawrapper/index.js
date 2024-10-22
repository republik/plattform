import React from 'react'


const Datawrapper = ({ datawrapperId, alt }) => {
  if (!datawrapperId) {
    return <p>No Datawrapper ID</p>
  }

  const html = `<div style="min-height:496px" id="datawrapper-vis-dKxYE">
      <script 
        type="text/javascript" 
        defer 
        src="https://datawrapper.dwcdn.net/dKxYE/embed.js" 
        charset="utf-8"
        data-target="#datawrapper-vis-dKxYE">
      </script>
      <noscript>
        <img src="https://datawrapper.dwcdn.net/dKxYE/full.png" alt="" />
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
