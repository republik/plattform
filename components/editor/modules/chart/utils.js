import React from 'react'
import ReactDOMServer from 'react-dom/server'

export const getSvgNode = (chartElement, width = 660) => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.cloneElement(chartElement, {
      width: 660
    })
  )
  const template = document.createElement('template')
  template.innerHTML = html

  const svg = document.importNode(
    template.content.querySelector('svg'),
    true
  )
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.style.margin = '0 auto'
  return svg
}

export const downloadOnClick = (getObject) => {
  return (e) => {
    const a = e.currentTarget
    const url = a.href = window.URL.createObjectURL(
      getObject()
    )
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 50)
  }
}

const svgNS = 'http://www.w3.org/2000/svg'

const fitTransform = ({
  innerWidth, innerHeight,
  outerWidth, outerHeight,
  offset = 0,
  // align 0 to 1, 0.5 = center
  alignLeft = 0.5,
  alignTop = 0.55 // slight gravitation to the ground
}) => {
  let width = innerWidth
  let height = innerHeight
  let scale = 1
  if (width > outerWidth) {
    scale = width / outerWidth
    width *= scale
    height *= scale
  }
  if (height > outerHeight) {
    scale = innerHeight / outerHeight
    width *= scale
    height *= scale
  }

  return `translate(${[
    offset + (outerWidth - width) * alignLeft,
    offset + (outerHeight - height) * alignTop
  ].join(' ')}) scale(${scale})`
}

export const createSvgBackgrounder = ({
  color = '#F6F8F7',
  width: bgWidth = 665,
  height: bgHeight = 347,
  padding = 20
} = {}) => ({svg, width, height, extent}) => {
  const bg = document.createElementNS(svgNS, 'rect')
  bg.setAttribute('x', extent[0])
  bg.setAttribute('y', extent[1])
  bg.setAttribute('width', bgWidth)
  bg.setAttribute('height', bgHeight)
  bg.setAttribute('fill', color)

  const g = document.createElementNS(svgNS, 'g')
  ;[...svg.childNodes].forEach(node => {
    g.appendChild(node)
  })

  g.setAttribute('transform', fitTransform({
    innerWidth: width,
    innerHeight: height,
    outerWidth: bgWidth - 2 * padding,
    outerHeight: bgHeight - 2 * padding,
    offset: padding
  }))

  svg.appendChild(bg)
  svg.appendChild(g)

  svg.setAttribute('width', bgWidth)
  svg.setAttribute('height', bgHeight)
  svg.setAttribute('viewBox', [
    extent[0],
    extent[1],
    bgWidth,
    bgHeight
  ].join(' '))

  return {
    svg,
    width: bgWidth,
    height: bgHeight
  }
}

export const getAbstractSvg = chartElement => {
  const svg = getSvgNode(chartElement, 660)

  const remove = [
    ...svg.querySelectorAll('text'),
    ...svg.querySelectorAll('line')
  ]

  remove.forEach(node => {
    node.parentNode.removeChild(node)
  })

  ;[
    ...svg.querySelectorAll('[stroke-width]')
  ].forEach(node => {
    node.setAttribute('stroke-width', +node.getAttribute('stroke-width') * 2)
  })

  document.body.appendChild(svg)
  const svgRect = svg.getBoundingClientRect()
  const extent = [...svg.childNodes]
    .filter(node => node.getBBox) // only SVGGraphicsElement: ignore desc
    .reduce((extent, node) => {
      const rect = node.getBoundingClientRect()
      const x = rect.left - svgRect.left
      const y = rect.top - svgRect.top
      return [
        Math.min(extent[0], x),
        Math.min(extent[1], y),
        Math.max(extent[2], x + rect.width),
        Math.max(extent[3], y + rect.height)
      ]
    }, [Infinity, Infinity, 0, 0])

  const width = Math.abs(extent[2] - extent[0])
  const height = Math.abs(extent[3] - extent[1])
  if (width && height) {
    svg.setAttribute('width', width + 10)
    svg.setAttribute('height', height + 10)
    svg.setAttribute('viewBox', [
      extent[0] - 5,
      extent[1] - 5,
      width + 10,
      height + 10
    ].join(' '))
  }
  document.body.removeChild(svg)

  return {
    svg,
    width,
    height,
    extent
  }
}
