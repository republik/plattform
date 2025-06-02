import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { css } from 'glamor'

import Bar, { Lollipop } from './Bars'
import TimeBar from './TimeBars'
import { Line, Slope } from './Lines'
import ScatterPlot from './ScatterPlots'
import { GenericMap, ProjectedMap, SwissMap } from './Maps'
import Hemicycle from './Hemicycle'
import Table from './Table'

import { mUp } from '../../theme/mediaQueries'
import {
  sansSerifMedium19,
  sansSerifMedium22,
  sansSerifRegular16,
  sansSerifRegular19,
} from '../Typography/styles'
import { fontRule } from '../Typography/Interaction'
import { Note } from '../Typography/Editorial'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import { ChartContextProvider } from './ChartContext'

export const ReactCharts = {
  Bar,
  Lollipop,
  TimeBar,
  Line,
  Slope,
  ScatterPlot,
  GenericMap,
  ProjectedMap,
  SwissMap,
  Hemicycle,
  Table,
}

export const createRanges = ({
  neutral,
  sequential,
  sequential3,
  opposite3,
  discrete,
}) => {
  const oppositeReversed = [].concat(opposite3).reverse()
  return {
    diverging1: [sequential3[1], opposite3[1]],
    diverging1n: [sequential3[1], neutral[0], opposite3[1]],
    diverging2: [...sequential3.slice(0, 2), ...oppositeReversed.slice(0, 2)],
    diverging3: [...sequential3, ...oppositeReversed],
    sequential3,
    sequential: sequential,
    discrete,
  }
}

const styles = {
  h: css({
    ...convertStyleToRem(sansSerifMedium19),
    lineHeight: pxToRem('25px'),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium22),
    },
    margin: 0,
    marginBottom: 15,
    '& + p': {
      marginTop: -15,
    },
  }),
  p: css({
    ...convertStyleToRem(sansSerifRegular16),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular19),
    },
    margin: 0,
    marginBottom: 15,
  }),
}

export const ChartTitle = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h3 {...props} {...styles.h} {...colorScheme.set('color', 'text')}>
      {children}
    </h3>
  )
}

export const ChartLead = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...props}
      {...styles.p}
      {...colorScheme.set('color', 'text')}
      {...fontRule}
    >
      {children}
    </p>
  )
}

export const ChartLegend = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <Note {...colorScheme.set('color', 'text')} style={{ marginTop: 15 }}>
      {children}
    </Note>
  )
}

const ssrAttribute = 'data-chart-ssr'

export const Chart = (props) => {
  const [colorScheme] = useColorContext()

  const isDomAvailable = typeof document !== 'undefined'
  const [ssrMode, setSsrMode] = useState(
    () =>
      !isDomAvailable ||
      (isDomAvailable &&
        document.querySelectorAll(`[${ssrAttribute}]`).length > 0),
  )
  useEffect(() => {
    if (ssrMode) {
      setSsrMode(false)
    }
  }, [ssrMode])

  const [stateWidth, setWidth] = useState(ssrMode ? 290 : undefined)

  const {
    width: fixedWidth,
    config,
    tLabel = (identity) => identity,
    t,
    // allowCanvasRendering might be set to false when exporting SVGs
    allowCanvasRendering = true,
  } = props

  const width = fixedWidth || stateWidth
  const ReactChart = ReactCharts[config.type]

  const colorRanges = useMemo(
    () => createRanges(colorScheme.ranges),
    [colorScheme],
  )

  const ref = useRef()
  useEffect(() => {
    if (fixedWidth) {
      return
    }
    const measure = () => {
      if (ref.current) {
        const { width } = ref.current.getBoundingClientRect()
        setWidth(width)
      }
    }
    window.addEventListener('resize', measure)
    measure()
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [fixedWidth])

  const colorContextExtension = useMemo(() => {
    if (!config.colorDarkMapping) {
      return null
    }
    const keys = Object.keys(config.colorDarkMapping)
    return {
      localColors: keys.reduce(
        (localColors, key, i) => {
          localColors.dark[`charts${i}`] = config.colorDarkMapping[key]
          localColors.light[`charts${i}`] = key
          return localColors
        },
        { dark: {}, light: {} },
      ),
      localMappings: keys.reduce(
        (mappings, key, i) => {
          mappings.charts[key] = `charts${i}`
          return mappings
        },
        { charts: {} },
      ),
    }
  }, [config])

  const content = (
    <div
      {...(ssrMode && { [ssrAttribute]: true })}
      ref={fixedWidth ? undefined : ref}
      style={{
        maxWidth: config.maxWidth,
      }}
    >
      {!!width && (
        <ChartContextProvider
          width={width}
          values={props.values}
          {...config}
          tLabel={tLabel}
          colorRanges={colorRanges}
        >
          <ReactChart
            {...config}
            allowCanvasRendering={allowCanvasRendering}
            // make colorScheme available for class components—maps
            colorScheme={colorScheme}
            tLabel={tLabel}
            t={t}
            colorRanges={colorRanges}
            width={width}
            values={props.values}
            description={config.description}
          />
        </ChartContextProvider>
      )}
    </div>
  )

  if (colorContextExtension) {
    return (
      <ColorContextLocalExtension {...colorContextExtension}>
        {content}
      </ColorContextLocalExtension>
    )
  }

  return content
}

Chart.propTypes = {
  values: PropTypes.array.isRequired,
  config: PropTypes.shape({
    type: PropTypes.oneOf(Object.keys(ReactCharts)).isRequired,
    description: PropTypes.string,
    maxWidth: PropTypes.number,
  }).isRequired,
  width: PropTypes.number,
  tLabel: PropTypes.func,
}
