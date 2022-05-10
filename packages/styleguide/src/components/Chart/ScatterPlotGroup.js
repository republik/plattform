import React, { useEffect, useState, useRef, useMemo, Fragment } from 'react'
import { css } from 'glamor'
import { min, ascending } from 'd3-array'
import { subsup, last } from './utils'
import { sansSerifMedium14, sansSerifRegular12 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import ScatterPlotContextBox from './ScatterPlotContextBox'
import { InlineLabel } from './ScatterPlotElements'
import ScatterPlotCanvas from './ScatterPlotCanvas'

const X_TICK_HEIGHT = 6

const styles = {
  columnTitle: css({
    ...sansSerifMedium14,
  }),
  axisLabel: css({
    ...sansSerifRegular12,
  }),
  axisLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
  annotationLine: css({
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round',
  }),
  annotationText: css({
    ...sansSerifRegular12,
  }),
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
  paddingBottom,
  yLinesPaddingLeft,
  xAxis,
  yAxis,
  maxYLine,
  getColor,
  xUnit,
  annotations,
  contextBoxProps,
  allowCanvasRendering,
}) => {
  const [hover, setHover] = useState([])
  const [hoverTouch, setHoverTouch] = useState()

  const containerRef = useRef()
  const hoverRectRef = useRef()
  const [colorScheme] = useColorContext()

  const plotHeight = height + paddingBottom + paddingTop
  const plotWidth = width + paddingLeft + paddingRight

  const symbols = useMemo(
    () =>
      values.map((value, i) => {
        return {
          key: `symbol${i}`,
          value,
          cx: plotX(value.x),
          cy: plotY(value.y),
          r: rSize(value.size),
        }
      }),
    [values, plotX, plotY, rSize],
  )

  const focusRef = useRef()
  const focus = (focusRef.current = (event) => {
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

    const withDistance = symbols.map((symbol) => {
      return {
        symbol,
        distance:
          Math.sqrt(
            Math.pow(symbol.cx - focusX, 2) + Math.pow(symbol.cy - focusY, 2),
          ) - symbol.r,
      }
    })
    let hoverItems = withDistance.filter(({ distance }) => distance < 1)
    if (hoverItems.length === 0) {
      const minDistance = min(withDistance, (d) => d.distance)
      if (minDistance < 10) {
        hoverItems = withDistance.filter(
          ({ distance }) => distance === minDistance,
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
    const focusCallback = (event) => focusRef.current(event)
    const blurCallback = () => {
      setHover([])
    }
    const rect = hoverRectRef.current
    rect.addEventListener('touchstart', focusCallback, {
      passive: false,
    })
    rect.addEventListener('touchmove', focusCallback)
    rect.addEventListener('touchend', blurCallback)
    return () => {
      rect.removeEventListener('touchstart', focusCallback, {
        passive: false,
      })
      rect.removeEventListener('touchmove', focusCallback)
      rect.removeEventListener('touchend', blurCallback)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {allowCanvasRendering && (
        <ScatterPlotCanvas
          opacity={opacity}
          symbols={symbols}
          getColor={getColor}
          width={plotWidth}
          height={plotHeight}
        />
      )}
      <svg
        width={plotWidth}
        height={plotHeight}
        style={{ position: 'relative' }}
      >
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
        {!allowCanvasRendering &&
          symbols.map((symbol) => (
            <circle
              key={symbol.key}
              fillOpacity={opacity}
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
                datum[inlineLabel] || datum[inlineSecondaryLabel],
            )
            .map((symbol) => (
              <Fragment key={`inlineLabel${symbol.key}`}>
                <InlineLabel
                  symbol={symbol}
                  inlineLabel={inlineLabel}
                  inlineSecondaryLabel={inlineSecondaryLabel}
                  inlineLabelPosition={inlineLabelPosition}
                />
              </Fragment>
            ))}
        {hover.map((symbol) => (
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
            data-axis
            key={tick}
            transform={`translate(${yLinesPaddingLeft},${plotY(tick)})`}
          >
            <line
              {...styles.axisLine}
              {...colorScheme.set('stroke', 'text')}
              x2={width + paddingLeft - yLinesPaddingLeft}
              style={{
                opacity:
                  base || (base === undefined && tick === 0) ? 0.8 : 0.17,
              }}
            />
            <text
              {...styles.axisLabel}
              {...colorScheme.set('fill', 'text')}
              dy='-3px'
            >
              {subsup.svg(label ?? yAxis.axisFormat(tick, last(plotYLines, i)))}
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
              data-axis
              key={`x${tick}`}
              transform={`translate(${plotX(tick)},${
                paddingTop + height + X_TICK_HEIGHT
              })`}
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
                    base || (base === undefined && tick === 0) ? 0.8 : 0.17,
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
                  label ?? xAxis.axisFormat(tick, last(plotXLines, i)),
                )}
              </text>
            </g>
          )
        })}
        <text
          x={width + paddingLeft}
          y={paddingTop + height + 28 + X_TICK_HEIGHT}
          textAnchor='end'
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {xUnit}
        </text>
        {annotations.map((annotation, i) => {
          const x1 = plotX(annotation.x1)
          const x2 = plotX(annotation.x2)
          const y1 = plotY(annotation.y1)
          const y2 = plotY(annotation.y2)

          const xSortedPoints = [
            [x1, y1],
            [x2, y2],
          ].sort((a, b) => ascending(a[0], b[0]))

          return (
            <Fragment key={`a${i}`}>
              <line
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
                {...styles.annotationLine}
                {...colorScheme.set('stroke', 'text')}
              />
              <circle
                r='3.5'
                cx={x1}
                cy={y1}
                {...colorScheme.set('stroke', 'text')}
                {...colorScheme.set('fill', 'textInverted')}
              />
              <circle
                r='3.5'
                cx={x2}
                cy={y2}
                {...colorScheme.set('stroke', 'text')}
                {...colorScheme.set('fill', 'textInverted')}
              />
              {annotation.label && (
                <text
                  x={x1 + (x2 - x1) / 2}
                  y={y1 + (y2 - y1) / 2}
                  textAnchor='start'
                  dy={
                    xSortedPoints[0][1] > xSortedPoints[1][1]
                      ? '1.2em'
                      : '-0.4em'
                  }
                  {...styles.annotationText}
                  {...colorScheme.set('fill', 'text')}
                >
                  {subsup.svg(annotation.label)}
                </text>
              )}
            </Fragment>
          )
        })}
        <rect
          fill='transparent'
          width={plotWidth}
          height={plotHeight}
          onMouseEnter={(e) => focus(e)}
          onMouseMove={(e) => focus(e)}
          onMouseLeave={(e) => blur(e)}
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
        width={plotWidth}
        height={plotHeight}
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
