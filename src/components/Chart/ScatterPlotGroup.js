import React, { useEffect, useState, useRef, Fragment } from 'react'
import { css } from 'glamor'
import { min } from 'd3-array'
import { subsup, last } from './utils'
import { sansSerifRegular12 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import ScatterPlotContextBox from './ScatterPlotContextBox'
import { InlineLabel } from './ScatterPlotElements'

const X_TICK_HEIGHT = 6

const styles = {
  axisLabel: css({
    ...sansSerifRegular12
  }),
  axisLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  })
}

const ScatterPlotGroup = ({
  values,
  plotX,
  plotY,
  rSize,
  description,
  title,
  inlineLabel,
  inlineSecondaryLabel,
  inlineLabelPosition,
  plotXLines,
  plotYLines,
  opacity,
  width,
  height,
  paddingTop,
  paddingLeft,
  paddingRight,
  yLinesPaddingLeft,
  xAxis,
  yAxis,
  maxYLine,
  getColor,
  xUnit,
  ...contextBoxProps
}) => {
  const [hover, setHover] = useState([])
  const [hoverTouch, setHoverTouch] = useState()

  const containerRef = useRef()
  const hoverRectRef = useRef()
  const [colorScheme] = useColorContext()

  const symbols = values.map((value, i) => {
    return {
      key: `symbol${i}`,
      value,
      cx: plotX(value.x),
      cy: plotY(value.y),
      r: rSize(value.size)
    }
  })

  const focusRef = useRef()
  const focus = (focusRef.current = event => {
    if (!symbols) {
      return
    }
    const { left, top } = containerRef.current.getBoundingClientRect()
    let hoverTouchItem = false
    let currentEvent = event
    if (currentEvent.changedTouches) {
      hoverTouchItem = true
      currentEvent = currentEvent.changedTouches[0]
    }

    const focusX = currentEvent.clientX - left
    const focusY = currentEvent.clientY - top

    const withDistance = symbols.map(symbol => {
      return {
        symbol,
        distance:
          Math.sqrt(
            Math.pow(symbol.cx - focusX, 2) + Math.pow(symbol.cy - focusY, 2)
          ) - symbol.r
      }
    })
    let hoverItems = withDistance.filter(({ distance }) => distance < 1)
    if (hoverItems.length === 0) {
      const minDistance = min(withDistance, d => d.distance)
      if (minDistance < 10) {
        hoverItems = withDistance.filter(
          ({ distance }) => distance === minDistance
        )
      }
    }
    if (hoverItems.length) {
      event.preventDefault()
    }
    hoverItems = hoverItems.map(({ symbol }) => symbol)
    setHover(hoverItems)
    setHoverTouch(hoverTouchItem)
  })
  const blur = () => {
    setHover([])
  }

  useEffect(() => {
    const focusCallback = event => focusRef.current(event)
    const blurCallback = () => {
      setHover([])
    }
    const rect = hoverRectRef.current
    rect.addEventListener('touchstart', focusCallback, {
      passive: false
    })
    rect.addEventListener('touchmove', focusCallback)
    rect.addEventListener('touchend', blurCallback)
    return () => {
      rect.removeEventListener('touchstart', focusCallback, {
        passive: false
      })
      rect.removeEventListener('touchmove', focusCallback)
      rect.removeEventListener('touchend', blurCallback)
    }
  }, [])

  return (
    <div ref={containerRef}>
      <svg width={width} height={height}>
        <desc>{description}</desc>
        {title && (
          <text
            dy='1.5em'
            {...styles.columnTitle}
            {...colorScheme.set('fill', 'text')}
          >
            {title}
          </text>
        )}
        {symbols.map(symbol => (
          <circle
            key={symbol.key}
            style={{ opacity }}
            {...colorScheme.set('fill', getColor(symbol.value), 'charts')}
            cx={symbol.cx}
            cy={symbol.cy}
            r={symbol.r}
          />
        ))}
        {(inlineLabel || inlineSecondaryLabel) &&
          symbols
            .filter(
              ({ value: { datum } }) =>
                datum[inlineLabel] || datum[inlineSecondaryLabel]
            )
            .map(symbol => (
              <Fragment key={`inlineLabel${symbol.key}`}>
                <InlineLabel
                  symbol={symbol}
                  inlineLabel={inlineLabel}
                  inlineSecondaryLabel={inlineSecondaryLabel}
                  inlineLabelPosition={inlineLabelPosition}
                />
              </Fragment>
            ))}
        {hover.map(symbol => (
          <circle
            key={`hover${symbol.key}`}
            fill='none'
            {...colorScheme.set('stroke', 'text')}
            cx={symbol.cx}
            cy={symbol.cy}
            r={symbol.r}
          />
        ))}
        {plotYLines.map(({ tick, label, base }, i) => (
          <g
            key={tick}
            transform={`translate(${yLinesPaddingLeft},${plotY(tick)})`}
          >
            <line
              {...styles.axisLine}
              {...colorScheme.set('stroke', 'text')}
              x2={width - paddingRight - yLinesPaddingLeft}
              style={{
                opacity: base || (base === undefined && tick === 0) ? 0.8 : 0.17
              }}
            />
            <text
              {...styles.axisLabel}
              {...colorScheme.set('fill', 'text')}
              dy='-3px'
            >
              {subsup.svg(label || yAxis.axisFormat(tick, last(plotYLines, i)))}
            </text>
          </g>
        ))}
        {plotXLines.map(({ tick, label, textAnchor, base }, i) => {
          if (!textAnchor) {
            textAnchor = 'middle'
            if (last(plotXLines, i)) {
              textAnchor = 'end'
            }
            if (i === 0 && paddingLeft < 20) {
              textAnchor = 'start'
            }
          }
          return (
            <g
              key={`x${tick}`}
              transform={`translate(${plotX(tick)},${paddingTop +
                height +
                X_TICK_HEIGHT})`}
            >
              <line
                {...styles.axisLine}
                {...colorScheme.set('stroke', 'text')}
                y2={
                  -(
                    (maxYLine
                      ? plotY(plotY.domain()[0]) - plotY(maxYLine.tick)
                      : height) + X_TICK_HEIGHT
                  )
                }
                style={{
                  opacity:
                    base || (base === undefined && tick === 0) ? 0.8 : 0.17
                }}
              />
              <text
                {...styles.axisLabel}
                {...colorScheme.set('fill', 'text')}
                y={5}
                dy='0.6em'
                textAnchor={textAnchor}
              >
                {subsup.svg(
                  label || xAxis.axisFormat(tick, last(plotXLines, i))
                )}
              </text>
            </g>
          )
        })}
        <text
          x={paddingLeft + width}
          y={paddingTop + height + 28 + X_TICK_HEIGHT}
          textAnchor='end'
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {xUnit}
        </text>
        <rect
          fill='transparent'
          width={width}
          height={height}
          onMouseEnter={e => focus(e)}
          onMouseMove={e => focus(e)}
          onMouseLeave={e => blur(e)}
          ref={
            /* touch events are added via ref for { passive: false } on touchstart
             * react does not support setting passive, which defaults to true in newer browsers
             * https://github.com/facebook/react/issues/6436
             */
            hoverRectRef
          }
        />
      </svg>
      <ScatterPlotContextBox
        width={width}
        height={height}
        xFormat={xAxis.format}
        yFormat={yAxis.format}
        hover={hover}
        hoverTouch={hoverTouch}
        {...contextBoxProps}
      />
    </div>
  )
}

export default ScatterPlotGroup
