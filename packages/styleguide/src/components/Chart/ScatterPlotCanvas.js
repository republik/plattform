import React, { useRef, useEffect } from 'react'

const ScatterPlotCanvas = ({ symbols, width, height, getColor, opacity }) => {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current

    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio

    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, width, height)

    ctx.globalAlpha = opacity
    symbols.forEach(({ cx, cy, r, value }) => {
      ctx.beginPath()
      ctx.moveTo(cx + r, cy)
      ctx.arc(cx, cy, r, 0, 2 * Math.PI)

      ctx.fillStyle = getColor(value)
      ctx.fill()
    })

    ctx.restore()
  }, [symbols, width, height, opacity, getColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
      }}
    />
  )
}

export default ScatterPlotCanvas
