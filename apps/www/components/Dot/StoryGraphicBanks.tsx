import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import { scaleLinear } from 'd3-scale'

import {
  useColorContext,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import {
  bankingData,
  PADDING_TOP,
  PADDING_LEFT,
  NEW_COLORS,
  bankingDataWithoutCSLow,
} from './config'
import { useResolvedColorSchemeKey } from '../ColorScheme/lib'

type StoryVariant = 'step0' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
const variantKeys: StoryVariant[] = [
  'step0',
  'step1',
  'step2',
  'step3',
  'step4',
  'step5',
]
const defineVariants = (
  defaultVariant: Variant,
  variants: Partial<Record<StoryVariant, Variant>>,
) => {
  const v: Partial<Record<StoryVariant, Variant>> = {}
  for (const k of variantKeys) {
    v[k] = variants[k] ?? defaultVariant
  }
  return v
}

const getVariant = (highlighted: number) => {
  switch (highlighted) {
    case 0:
      return 'step1'
    case 1:
      return 'step2'
    case 2:
      return 'step3'
    case 3:
      return 'step4'
    case 4:
      return 'step5'
  }
  return 'step0'
}

const getDomain = (values, ...keys) => {
  const maxValue = Math.max(
    ...keys.map((key) => Math.max(...values.map((d) => d[key]))),
  )
  const minValue = Math.min(
    ...keys.map((key) => Math.min(...values.map((d) => d[key]))),
  )
  return [minValue, maxValue]
}

const costDomain = getDomain(bankingDataWithoutCSLow, 'costs', 'benefit')
const costDomainWithCS = getDomain(bankingData, 'costs', 'benefit')
const chartRange = [0, 235]

const costScale = scaleLinear().domain(costDomain).range(chartRange)

const costScaleAll = scaleLinear().domain(costDomainWithCS).range(chartRange)

const getBankById = (array, bank) => array.find((d) => d.bank === bank)

const getCostPosition = (bank) =>
  chartRange[1] - costScale(getBankById(bankingDataWithoutCSLow, bank).costs)

const getBenefitPosition = (bank) =>
  chartRange[1] - costScale(getBankById(bankingDataWithoutCSLow, bank).benefit)

const getCostPositionWithCS = (bank) =>
  chartRange[1] - costScaleAll(getBankById(bankingData, bank).costs)

const getBenefitPositionWithCS = (bank) =>
  chartRange[1] - costScaleAll(getBankById(bankingData, bank).benefit)

const RADIUS = 14
const PADDING_LEFT_CHART = 150
const CHART_WIDTH = 250

export const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
  const key = useResolvedColorSchemeKey()
  return (
    <motion.svg
      viewBox='0 0 930 360'
      preserveAspectRatio='xMidYMid meet'
      style={{ width: '100%', height: '100%' }}
      {...colorScheme.set('background-color', 'transparentBackground')}
      initial='step0'
      animate={getVariant(highlighted)}
    >
      {/* <defs>
        <marker
          id='arrowhead'
          viewBox='0 0 10 10'
          refX='3'
          refY='5'
          markerWidth='6'
          markerHeight='6'
          orient='auto'
        >
          <path d='M 0 0 L 10 5 L 0 10 z' style={{ fill: 'currentcolor' }} />
        </marker>
      </defs> */}

      <g transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}>
        {/* left side */}
        <motion.line
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART,
              y1: chartRange[1],
              x2: PADDING_LEFT_CHART,
              y2: '0',
              pathLength: 0,
            },
            {
              step1: {
                x1: PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
              },
              step2: {
                x1: PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
              },
              step3: {
                x1: PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
              },
              step4: {
                x1: PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
              },
            },
          )}
        ></motion.line>
        {/* right side */}
        <motion.line
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART + CHART_WIDTH,
              y1: chartRange[1],
              x2: PADDING_LEFT_CHART + CHART_WIDTH,
              y2: '0',
              opacity: 0,
            },
            {
              step3: {
                x1: PADDING_LEFT_CHART + CHART_WIDTH,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
              },

              step4: {
                x1: PADDING_LEFT_CHART + CHART_WIDTH,
                y1: chartRange[1],
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
              },
            },
          )}
        ></motion.line>
        {/* slope lines */}
        <motion.line
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART,
              y1: getCostPosition('UBS'),
              x2: PADDING_LEFT_CHART + CHART_WIDTH,
              y2: getBenefitPosition('UBS'),
              pathLength: 0,
              stroke: NEW_COLORS[key].one,
            },
            {
              step3: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPosition('UBS'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPosition('UBS'),
                stroke: NEW_COLORS[key].one,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 1, duration: 0.5 },
              },
              step4: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('UBS'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPositionWithCS('UBS'),
                stroke: NEW_COLORS[key].one,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART,
              y1: getCostPosition('Raiffeisen'),
              x2: PADDING_LEFT_CHART + CHART_WIDTH,
              y2: getBenefitPosition('Raiffeisen'),
              pathLength: 0,
              stroke: NEW_COLORS[key].four,
            },
            {
              step3: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPosition('Raiffeisen'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPosition('Raiffeisen'),
                stroke: NEW_COLORS[key].four,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 1, duration: 0.5 },
              },
              step4: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Raiffeisen'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPositionWithCS('Raiffeisen'),
                stroke: NEW_COLORS[key].four,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART,
              y1: getCostPosition('Zuger Kantonalbank'),
              x2: PADDING_LEFT_CHART + CHART_WIDTH,
              y2: getBenefitPosition('Zuger Kantonalbank'),
              pathLength: 0,
              stroke: NEW_COLORS[key].three,
            },
            {
              step3: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPosition('Zuger Kantonalbank'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPosition('Zuger Kantonalbank'),
                stroke: NEW_COLORS[key].three,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 1, duration: 0.5 },
              },
              step4: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Zuger Kantonalbank'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPositionWithCS('Zuger Kantonalbank'),
                stroke: NEW_COLORS[key].three,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: PADDING_LEFT_CHART,
              y1: getCostPosition('Kantonalbank Vaudoise'),
              x2: PADDING_LEFT_CHART + CHART_WIDTH,
              y2: getBenefitPosition('Kantonalbank Vaudoise'),
              pathLength: 0,
              stroke: NEW_COLORS[key].five,
            },
            {
              step3: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPosition('Kantonalbank Vaudoise'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPosition('Kantonalbank Vaudoise'),
                stroke: NEW_COLORS[key].five,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 1, duration: 0.5 },
              },
              step4: {
                x1: PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x2: PADDING_LEFT_CHART + CHART_WIDTH,
                y2: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                stroke: NEW_COLORS[key].five,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.line>
        {/* circles for cost */}
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('UBS'),
              x: 150,
              opacity: 0,
              r: 0,
            },
            {
              step1: {
                y: getCostPosition('UBS'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step2: {
                y: getCostPosition('UBS'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step3: {
                y: getCostPosition('UBS'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step4: {
                y: getCostPositionWithCS('UBS'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Credit Suisse'),
              x: 150,
              opacity: 0,
              r: 0,
            },
            {
              step1: {
                y: getCostPosition('Credit Suisse'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 1 },
              },
              step2: {
                y: getCostPosition('Credit Suisse'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step3: {
                y: getCostPosition('Credit Suisse'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step4: {
                y: getCostPositionWithCS('Credit Suisse'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Zuger Kantonalbank'),
              x: 150,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step3: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step4: {
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Raiffeisen'),
              x: 150,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Raiffeisen'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 1 },
              },
              step3: {
                y: getCostPosition('Raiffeisen'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Raiffeisen'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Kantonalbank Vaudoise'),
              x: 150,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Kantonalbank Vaudoise'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
              step3: {
                y: getCostPosition('Kantonalbank Vaudoise'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x: 150,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        {/* circles for benefit */}
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('UBS'),
              x: PADDING_LEFT_CHART + CHART_WIDTH,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('UBS'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
              },
              step4: {
                y: getBenefitPosition('UBS'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Credit Suisse'),
              x: PADDING_LEFT_CHART + CHART_WIDTH,
              opacity: 0,
              r: 0,
            },
            {
              step4: {
                y: getBenefitPositionWithCS('Credit Suisse'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Zuger Kantonalbank'),
              x: PADDING_LEFT_CHART + CHART_WIDTH,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Zuger Kantonalbank'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
              },
              step4: {
                y: getBenefitPositionWithCS('Zuger Kantonalbank'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Raiffeisen'),
              x: PADDING_LEFT_CHART + CHART_WIDTH,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Raiffeisen'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
              },
              step4: {
                y: getBenefitPositionWithCS('Raiffeisen'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Kantonalbank Vaudoise'),
              x: PADDING_LEFT_CHART + CHART_WIDTH,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Kantonalbank Vaudoise'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
              },
              step4: {
                y: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                x: PADDING_LEFT_CHART + CHART_WIDTH,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
      </g>
    </motion.svg>
  )
}

const styles = {
  label: css({
    ...fontStyles.sansSerifRegular23,
    [mediaQueries.onlyS]: {
      fontSize: '1.7rem',
    },
  }),
}
