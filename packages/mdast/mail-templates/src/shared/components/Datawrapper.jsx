import React from 'react'
import { EdgeToEdgeFigure, Figure } from './Figure'

// We generate the following images in Datawrapper upon publishing:
//  1. https://datawrapper.dwcdn.net/DW123ID/mail.png -> 450px wide
//  2. https://datawrapper.dwcdn.net/DW123ID/mailplain.png -> 450px wide, no header or footer
//  3. https://datawrapper.dwcdn.net/DW123ID/edgetoedge.png -> 1280px wide
//  4. https://datawrapper.dwcdn.net/DW123ID/edgetoedgeplain.png -> 1280px wide, no header or footer

const Chart = ({ src, alt, width }) => (
  <img
    key='image'
    style={{
      border: '0px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100%',
      width,
    }}
    width={width}
    src={src}
    alt={alt}
  />
)

export const Datawrapper = ({ datawrapperId, alt, plain }) => (
  <Figure>
    <Chart
      src={`https://datawrapper.dwcdn.net/${datawrapperId}/mail${plain ? 'plain' : ''}.png`}
      width={450}
      alt={alt}
    />
  </Figure>
)

export const EdgeToEdgeDatawrapper = ({ datawrapperId, alt, plain }) => (
  <EdgeToEdgeFigure>
    <Chart
      src={`https://datawrapper.dwcdn.net/${datawrapperId}/edgetoedge${plain ? 'plain' : ''}.png`}
      width={1280}
      alt={alt}
    />
  </EdgeToEdgeFigure>
)
