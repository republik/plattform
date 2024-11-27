import React from 'react'
import { Figure } from './Figure'

// We generate the following images in Datawrapper upon publishing:
//  1. https://datawrapper.dwcdn.net/DW123ID/mail.png -> 450px wide
//  2. https://datawrapper.dwcdn.net/DW123ID/mailplain.png -> 450px wide, no header or footer

const Chart = ({ src, width }) => (
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
  />
)

export const Datawrapper = ({ datawrapperId, plain }) => (
  <Figure>
    <Chart
      src={`https://datawrapper.dwcdn.net/${datawrapperId}/mail${plain ? 'plain' : ''}.png`}
      width={450}
    />
  </Figure>
)
