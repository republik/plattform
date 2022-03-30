import { cloneElement } from 'react'
import ReactDOMServer from 'react-dom/server'

export const getSvgNode = (chartElement, width = 660) => {
  const svgs = getSvgNodes(chartElement, width)

  if (svgs.length === 1) {
    const svg = svgs[0].svg
    svg.setAttribute('xmlns', svgNS)
    return svg
  }

  const exportSvg = document.createElement('svg')
  exportSvg.setAttribute('xmlns', svgNS)

  let exportWidth = 0
  let exportHeight = 0

  svgs.forEach(({ svg, rect }) => {
    const g = document.createElementNS(svgNS, 'g')
    g.setAttribute('transform', `translate(${rect.x}, ${rect.y})`)
    ;[...svg.childNodes].forEach((child) => {
      if (child.getBBox) {
        g.appendChild(child)
      } else {
        exportSvg.appendChild(child)
      }
    })
    exportSvg.appendChild(g)

    exportWidth = Math.max(exportWidth, rect.x + rect.width)
    exportHeight = Math.max(exportHeight, rect.y + rect.height)
  })
  exportSvg.setAttribute('width', exportWidth)
  exportSvg.setAttribute('height', exportHeight)

  return exportSvg
}

export const getSvgNodes = (chartElement, width) => {
  const html = ReactDOMServer.renderToStaticMarkup(
    cloneElement(chartElement, {
      width,
      allowCanvasRendering: false,
      config: {
        ...chartElement.props.config,
        colorDarkMapping: undefined,
      },
    }),
  )
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = 0
  container.style.top = 0
  container.style.width = `${width}px`
  container.innerHTML = html
  document.body.appendChild(container)

  const nodes = [...container.querySelectorAll('svg')].map((svg) => {
    ;[
      ...svg.querySelectorAll(
        'circle,ellipse,line,path,polygon,polyline,rect,text,use',
      ),
    ].forEach((node) => {
      const compStyles = window.getComputedStyle(node)
      node.setAttribute('fill', compStyles.getPropertyValue('fill'))
      node.setAttribute('stroke', compStyles.getPropertyValue('stroke'))
      node.setAttribute(
        'stroke-dasharray',
        compStyles.getPropertyValue('stroke-dasharray'),
      )
    })

    return {
      svg,
      rect: svg.getBoundingClientRect(),
    }
  })
  document.body.removeChild(container)

  return nodes
}

export const downloadBlobOnClick = (getObject) => {
  return (e) => {
    const a = e.currentTarget
    const url = (a.href = window.URL.createObjectURL(getObject()))
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 50)
  }
}

export const downloadPngOnClick = (getObject, scale = 2.5) => {
  return (e) => {
    e.preventDefault()
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const { svg, width, height } = getObject()

    canvas.width = width * scale
    canvas.height = height * scale
    context.scale(scale, scale)

    const filename = e.currentTarget.getAttribute('download')

    const image = new window.Image()
    image.src = `data:image/svg+xml,${encodeURIComponent(svg.outerHTML)}`
    image.onload = () => {
      context.drawImage(image, 0, 0)

      const a = document.createElement('a')
      a.download = filename || 'image.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
      setTimeout(() => {
        a.href = '#'
      }, 50)
    }
  }
}

const svgNS = 'http://www.w3.org/2000/svg'

const fitTransform = ({
  innerWidth,
  innerHeight,
  outerWidth,
  outerHeight,
  offset = 0,
  // align 0 to 1, 0.5 = center
  alignLeft = 0.5,
  alignTop = 0.55, // slight gravitation to the ground
}) => {
  let width = innerWidth
  let height = innerHeight
  let scale = 1
  if (width > outerWidth) {
    scale = outerWidth / width
    width *= scale
    height *= scale
  }
  if (height > outerHeight) {
    scale = outerHeight / height
    width *= scale
    height *= scale
  }

  return `translate(${[
    offset + (outerWidth - width) * alignLeft,
    offset + (outerHeight - height) * alignTop,
  ].join(' ')}) scale(${scale})`
}

export const DEFAULT_BG = '#F6F8F7'

export const createSvgBackgrounder =
  ({
    color = DEFAULT_BG,
    width: bgWidth = 665,
    height: bgHeight = 347,
    padding = 20,
  } = {}) =>
  ({ svg, width, height, extent }) => {
    const bg = document.createElementNS(svgNS, 'rect')
    bg.setAttribute('x', extent[0])
    bg.setAttribute('y', extent[1])
    bg.setAttribute('width', bgWidth)
    bg.setAttribute('height', bgHeight)
    bg.setAttribute('fill', color)

    const g = document.createElementNS(svgNS, 'g')
    ;[...svg.childNodes].forEach((node) => {
      g.appendChild(node)
    })

    g.setAttribute(
      'transform',
      fitTransform({
        innerWidth: Math.abs(extent[2] - extent[0]),
        innerHeight: Math.abs(extent[3] - extent[1]),
        outerWidth: bgWidth - 2 * padding,
        outerHeight: bgHeight - 2 * padding,
        offset: padding,
      }),
    )

    svg.appendChild(bg)
    svg.appendChild(g)

    svg.setAttribute('width', bgWidth)
    svg.setAttribute('height', bgHeight)
    svg.setAttribute(
      'viewBox',
      [extent[0], extent[1], bgWidth, bgHeight].join(' '),
    )

    return {
      svg,
      width: bgWidth,
      height: bgHeight,
    }
  }

export const getAbstractSvg = (chartElement) => {
  let svg = getSvgNode(chartElement)

  const remove = [
    ...svg.querySelectorAll('text'),
    ...svg.querySelectorAll('[data-axis]'),
  ]

  remove.forEach((node) => {
    node.parentNode.removeChild(node)
  })
  ;[...svg.querySelectorAll('[stroke-width]')].forEach((node) => {
    node.setAttribute('stroke-width', +node.getAttribute('stroke-width') * 2)
  })
  ;[...svg.querySelectorAll('a')].forEach((node) => {
    node.removeAttribute('xlink:href')
  })

  // force re-rendering for bounding rects
  const container = document.createElement('div')
  container.innerHTML = svg.outerHTML
  document.body.appendChild(container)
  svg = container.querySelector('svg')

  const svgRect = svg.getBoundingClientRect()

  const extent = [...svg.childNodes]
    .filter((node) => node.getBBox) // only SVGGraphicsElement: ignore desc
    .reduce(
      (extent, node) => {
        const rect = node.getBoundingClientRect()
        const x = rect.left - svgRect.left
        const y = rect.top - svgRect.top
        return [
          Math.min(extent[0], x),
          Math.min(extent[1], y),
          Math.max(extent[2], x + rect.width),
          Math.max(extent[3], y + rect.height),
        ]
      },
      [Infinity, Infinity, 0, 0],
    )
  let width = Math.abs(extent[2] - extent[0])
  let height = Math.abs(extent[3] - extent[1])
  if (width && height) {
    const padding = 5
    width += padding * 2
    height += padding * 2
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)
    svg.setAttribute(
      'viewBox',
      [extent[0] - padding, extent[1] - padding, width, height].join(' '),
    )
  }
  document.body.removeChild(container)

  return {
    svg,
    width,
    height,
    extent,
  }
}
