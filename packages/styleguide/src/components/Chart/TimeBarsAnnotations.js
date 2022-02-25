import React from 'react'
import { css } from 'glamor'
import {
  sansSerifMedium12 as VALUE_FONT,
  sansSerifRegular12 as LABEL_FONT,
} from '../Typography/styles'
import { createTextGauger } from '../../lib/textGauger'
import { useColorContext } from '../Colors/useColorContext'
import { textAlignmentDict } from './utils'

const valueGauger = createTextGauger(VALUE_FONT, {
  dimension: 'width',
  html: true,
})
const labelGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true,
})

const styles = {
  annotationLine: css({
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round',
  }),
  annotationLineValue: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
  annotationValue: css({
    ...VALUE_FONT,
  }),
  annotationText: css({
    ...LABEL_FONT,
  }),
}

const showAnnotationValue = (annotation) => annotation.showValue !== false

export const YAnnotation = ({ annotation, width, tLabel, yFormat, xCalc }) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      <line
        x1={0}
        x2={width}
        {...styles.annotationLine}
        {...colorScheme.set('stroke', 'text')}
      />
      <circle
        r='3.5'
        cx={annotation.x ? xCalc(annotation.x) : 4}
        {...colorScheme.set('stroke', 'text')}
        {...colorScheme.set('fill', 'textInverted')}
      />
      <text
        x={width}
        textAnchor='end'
        dy={annotation.dy || '-0.4em'}
        {...styles.annotationText}
        {...colorScheme.set('fill', 'text')}
      >
        {tLabel(annotation.label)}
        {showAnnotationValue(annotation) && (
          <>
            {' '}
            {yFormat(annotation.value)} {tLabel(annotation.unit)}
          </>
        )}
      </text>
    </>
  )
}

export const XAnnotation = ({
  annotation,
  tLabel,
  yFormat,
  barWidth,
  xCalc,
  width,
}) => {
  const [colorScheme] = useColorContext()
  if (
    annotation.ghost &&
    !annotation.valuePrefix &&
    !annotation.label &&
    !annotation.position
  ) {
    return null
  }
  const isRange = annotation.x1 !== undefined && annotation.x2 !== undefined

  const labelText = tLabel(annotation.label)
  const valueText =
    showAnnotationValue(annotation) &&
    [
      tLabel(annotation.valuePrefix),
      yFormat(annotation.value),
      annotation.unit ? ' ' : '',
      tLabel(annotation.unit),
    ]
      .filter(Boolean)
      .join('')

  const textSize = Math.max(
    labelText ? labelGauger(labelText) : 0,
    valueText ? valueGauger(valueText) : 0,
  )
  const x1 = annotation.leftLabel
    ? 0
    : isRange
    ? xCalc(annotation.x1)
    : xCalc(annotation.x)
  const x2 = isRange
    ? xCalc(annotation.x2) + barWidth
    : x1 + Math.max(barWidth, 8)

  let textAnchor = 'middle'
  let tx = annotation.leftLabel ? 0 : x1 + (x2 - x1) / 2
  if (annotation.leftLabel) {
    textAnchor = 'start'
  } else if (annotation.textAlignment === undefined) {
    if (x1 + (x2 - x1) / 2 + textSize / 2 > width) {
      textAnchor = 'end'
      tx = x2
      if ((isRange ? x2 : x1) - textSize < 0) {
        textAnchor = 'start'
        tx = x1
      }
    } else {
      textAnchor = 'middle'
    }
  } else {
    textAnchor = textAlignmentDict[annotation.textAlignment]
  }

  const isBottom = annotation.position === 'bottom'
  return (
    <>
      <line
        x1={x1}
        x2={x2}
        {...(isRange ? styles.annotationLine : styles.annotationLineValue)}
        {...colorScheme.set('stroke', 'text')}
      />
      {annotation.leftLabel === undefined && (
        <circle
          r='3.5'
          cx={x1}
          {...colorScheme.set('stroke', 'text')}
          {...colorScheme.set('fill', 'textInverted')}
        />
      )}
      {isRange && (
        <circle
          r='3.5'
          cx={x2}
          {...colorScheme.set('stroke', 'text')}
          {...colorScheme.set('fill', 'textInverted')}
        />
      )}
      <text
        x={tx}
        textAnchor={textAnchor}
        dy={
          valueText
            ? isBottom
              ? '2.7em'
              : '-1.8em'
            : isBottom
            ? '1.4em'
            : '-0.5em'
        }
        {...styles.annotationText}
        {...colorScheme.set('fill', 'text')}
      >
        {labelText}
      </text>
      {valueText && (
        <text
          x={tx}
          textAnchor={textAnchor}
          dy={isBottom ? '1.4em' : '-0.5em'}
          {...styles.annotationValue}
          {...colorScheme.set('fill', 'text')}
        >
          {valueText}
        </text>
      )}
    </>
  )
}
