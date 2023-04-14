import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import { scaleLinear } from 'd3-scale'

import {
  useColorContext,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import { swissNumbers } from '../../lib/utils/format'

import {
  bankingLabelData,
  bankingPositionData,
  PADDING_TOP,
  PADDING_LEFT,
  NEW_COLORS,
  creditSuiseHistoricalData,
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

const formatOneDecimal = swissNumbers.format(',.3r')

// const getDomain = (values, ...keys) => {
//   const maxValue = Math.max(
//     ...keys.map((key) => Math.max(...values.map((d) => d[key]))),
//   )
//   const minValue = Math.min(
//     ...keys.map((key) => Math.min(...values.map((d) => d[key]))),
//   )
//   return [minValue, maxValue]
// }

// TODO: refactor

const costDomainWithoutCS = [104462, 257575]
const costDomainAll = [-32928, 257575]

const chartRange = [0, 235]

const costScale = scaleLinear().domain(costDomainWithoutCS).range(chartRange)

const costScaleAll = scaleLinear().domain(costDomainAll).range(chartRange)

const getBankById = (array, bank) => array.find((d) => d.bank === bank)

const getCostPosition = (bank) =>
  chartRange[1] - costScale(getBankById(bankingPositionData, bank).costs)

const getBenefitPosition = (bank) =>
  chartRange[1] - costScale(getBankById(bankingPositionData, bank).benefit)

const getCostPositionWithCS = (bank) =>
  chartRange[1] - costScaleAll(getBankById(bankingPositionData, bank).costs)

const getBenefitPositionWithCS = (bank) =>
  chartRange[1] - costScaleAll(getBankById(bankingPositionData, bank).benefit)

const RADIUS = 9
const PADDING_LEFT_CHART = 100
const WIDTH = 930
const CENTER = WIDTH / 2

export const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
  const key = useResolvedColorSchemeKey()
  return (
    <motion.svg
      viewBox='0 0 930 420'
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
        <motion.text
          {...styles.axisTick}
          variants={defineVariants(
            {
              x: CENTER,
              y: chartRange[0] - 35,
              opacity: 0,
              textAnchor: 'middle',
            },
            {
              step1: {
                x: CENTER,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5 },
                textAnchor: 'middle',
              },
              step2: {
                x: CENTER,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'middle',
              },
              step3: {
                x: CENTER - PADDING_LEFT_CHART,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step4: {
                x: CENTER - PADDING_LEFT_CHART,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
            },
          )}
        >
          Personalausgaben pro FTE
        </motion.text>
        <motion.line
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              x1: CENTER,
              y1: chartRange[1],
              x2: CENTER,
              y2: '0',
              pathLength: 1,
              opacity: 1,
              strokeWidth: '3px',
              stroke: NEW_COLORS[key].default,
            },
            {
              step3: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: CENTER - PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: CENTER - PADDING_LEFT_CHART,
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
              x1: CENTER + PADDING_LEFT_CHART,
              y1: chartRange[1],
              x2: CENTER + PADDING_LEFT_CHART,
              y2: '0',
              opacity: 0,
            },
            {
              step3: {
                x1: CENTER + PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: CENTER + PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
                transition: { duration: 0.5, delay: 1.5 },
              },

              step4: {
                x1: CENTER + PADDING_LEFT_CHART,
                y1: chartRange[1],
                x2: CENTER + PADDING_LEFT_CHART,
                y2: '0',
                stroke: NEW_COLORS[key].default,
                strokeWidth: '3px',
                opacity: 1,
              },
            },
          )}
        ></motion.line>
        <motion.text
          {...styles.axisTick}
          variants={defineVariants(
            {
              x: CENTER + PADDING_LEFT_CHART,
              y: chartRange[0] - 35,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step3: {
                x: CENTER + PADDING_LEFT_CHART,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'start',
              },
              step4: {
                x: CENTER + PADDING_LEFT_CHART,
                y: chartRange[0] - 35,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'start',
              },
            },
          )}
        >
          Gewinn pro FTE
        </motion.text>
        {/* slope lines */}
        <motion.line
          variants={defineVariants(
            {
              x1: CENTER - PADDING_LEFT_CHART,
              y1: getCostPosition('UBS'),
              x2: CENTER + PADDING_LEFT_CHART,
              y2: getBenefitPosition('UBS'),
              pathLength: 0,
              stroke: NEW_COLORS[key].one,
            },
            {
              step3: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPosition('UBS'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPosition('UBS'),
                stroke: NEW_COLORS[key].one,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 2, duration: 1 },
              },
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('UBS'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPositionWithCS('UBS'),
                stroke: NEW_COLORS[key].one,
                strokeWidth: '3px',
                opacity: 0.3,
                pathLength: 1,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: CENTER - PADDING_LEFT_CHART,
              y1: getCostPosition('Raiffeisen'),
              x2: CENTER + PADDING_LEFT_CHART,
              y2: getBenefitPosition('Raiffeisen'),
              pathLength: 0,
              stroke: NEW_COLORS[key].four,
            },
            {
              step3: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPosition('Raiffeisen'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPosition('Raiffeisen'),
                stroke: NEW_COLORS[key].four,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 2, duration: 1 },
              },
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Raiffeisen'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPositionWithCS('Raiffeisen'),
                stroke: NEW_COLORS[key].four,
                strokeWidth: '3px',
                opacity: 0.3,
                pathLength: 1,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: CENTER - PADDING_LEFT_CHART,
              y1: getCostPosition('Zuger Kantonalbank'),
              x2: CENTER + PADDING_LEFT_CHART,
              y2: getBenefitPosition('Zuger Kantonalbank'),
              pathLength: 0,
              stroke: NEW_COLORS[key].three,
            },
            {
              step3: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPosition('Zuger Kantonalbank'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPosition('Zuger Kantonalbank'),
                stroke: NEW_COLORS[key].three,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 2, duration: 1 },
              },
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Zuger Kantonalbank'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPositionWithCS('Zuger Kantonalbank'),
                stroke: NEW_COLORS[key].three,
                strokeWidth: '3px',
                opacity: 0.3,
                pathLength: 1,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: CENTER - PADDING_LEFT_CHART,
              y1: getCostPosition('Kantonalbank Vaudoise'),
              x2: CENTER + PADDING_LEFT_CHART,
              y2: getBenefitPosition('Kantonalbank Vaudoise'),
              pathLength: 0,
              stroke: NEW_COLORS[key].five,
            },
            {
              step3: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPosition('Kantonalbank Vaudoise'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPosition('Kantonalbank Vaudoise'),
                stroke: NEW_COLORS[key].five,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { delay: 2, duration: 1 },
              },
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                stroke: NEW_COLORS[key].five,
                strokeWidth: '3px',
                opacity: 0.3,
                pathLength: 1,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.line>
        <motion.line
          variants={defineVariants(
            {
              x1: CENTER - PADDING_LEFT_CHART,
              y1: getCostPositionWithCS('Credit Suisse'),
              x2: CENTER + PADDING_LEFT_CHART,
              y2: getBenefitPositionWithCS('Credit Suisse'),
              pathLength: 0,
              stroke: NEW_COLORS[key].two,
            },
            {
              step4: {
                x1: CENTER - PADDING_LEFT_CHART,
                y1: getCostPositionWithCS('Credit Suisse'),
                x2: CENTER + PADDING_LEFT_CHART,
                y2: getBenefitPositionWithCS('Credit Suisse'),
                stroke: NEW_COLORS[key].two,
                strokeWidth: '3px',
                opacity: 1,
                pathLength: 1,
                transition: { duration: 1.5, delay: 2 },
              },
            },
          )}
        ></motion.line>
        {/* circles for cost */}
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('UBS'),
              x: CENTER,
              opacity: 1,
              r: RADIUS,
              fill: NEW_COLORS[key].one,
            },
            {
              step1: {
                y: getCostPosition('UBS'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step2: {
                y: getCostPosition('UBS'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 1 },
              },
              step3: {
                y: getCostPosition('UBS'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('UBS'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Zuger Kantonalbank'),
              x: CENTER,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 1 },
              },
              step3: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Credit Suisse'),
              x: CENTER,
              opacity: 1,
              r: RADIUS,
              fill: NEW_COLORS[key].two,
            },
            {
              step1: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 1 },
              },
              step2: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 1 },
              },
              step3: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Credit Suisse'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getCostPosition('Raiffeisen'),
              x: CENTER,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 1.5 },
              },
              step3: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Raiffeisen'),
                x: CENTER - PADDING_LEFT_CHART,
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
              x: CENTER,
              opacity: 0,
              r: 0,
            },
            {
              step2: {
                y: getCostPosition('Kantonalbank Vaudoise'),
                x: CENTER,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 0.5 },
              },
              step3: {
                y: getCostPosition('Kantonalbank Vaudoise'),
                x: CENTER - PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x: CENTER - PADDING_LEFT_CHART,
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
              x: CENTER + PADDING_LEFT_CHART,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('UBS'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 3 },
              },
              step4: {
                y: getBenefitPositionWithCS('UBS'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].one,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPositionWithCS('Credit Suisse'),
              x: CENTER + PADDING_LEFT_CHART,
              opacity: 0,
              r: 0,
            },
            {
              step4: {
                y: getBenefitPositionWithCS('Credit Suisse'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].two,
                transition: { duration: 0.5, delay: 3 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Zuger Kantonalbank'),
              x: CENTER + PADDING_LEFT_CHART,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Zuger Kantonalbank'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 3 },
              },
              step4: {
                y: getBenefitPositionWithCS('Zuger Kantonalbank'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].three,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        <motion.circle
          variants={defineVariants(
            {
              y: getBenefitPosition('Raiffeisen'),
              x: CENTER + PADDING_LEFT_CHART,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Raiffeisen'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].four,
                transition: { duration: 0.5, delay: 3 },
              },
              step4: {
                y: getBenefitPositionWithCS('Raiffeisen'),
                x: CENTER + PADDING_LEFT_CHART,
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
              y: getBenefitPosition('Kantonalbank Vaudoise'),
              x: CENTER + PADDING_LEFT_CHART,
              opacity: 0,
              r: 0,
            },
            {
              step3: {
                y: getBenefitPosition('Kantonalbank Vaudoise'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 3 },
              },
              step4: {
                y: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                x: CENTER + PADDING_LEFT_CHART,
                r: RADIUS,
                opacity: 1,
                fill: NEW_COLORS[key].five,
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
        ></motion.circle>
        {/* labels */}
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('UBS'),
              x: CENTER - 25,
              opacity: 0,
              textAnchor: 'end',
            },
            {
              step1: {
                y: getCostPosition('UBS'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5 },
                textAnchor: 'end',
              },
              step2: {
                y: getCostPosition('UBS'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step3: {
                y: getCostPosition('UBS'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                textAnchor: 'end',
                transition: { duration: 0.5, delay: 1 },
              },
              step4: {
                y: getCostPositionWithCS('UBS'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 0,
                textAnchor: 'end',
                transition: { duration: 0.5, delay: 1 },
              },
            },
          )}
          dy='.35em'
        >
          UBS
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Credit Suisse'),
              x: CENTER - 25,
              opacity: 0,
              textAnchor: 'end',
            },
            {
              step1: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5 },
                textAnchor: 'end',
              },
              step2: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step3: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step4: {
                y: getCostPositionWithCS('Credit Suisse'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step5: {
                y: getCostPositionWithCS('Credit Suisse'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
            },
          )}
          dy='.35em'
        >
          Credit Suisse
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Zuger Kantonalbank'),
              x: CENTER - 25,
              opacity: 0,
              textAnchor: 'end',
            },
            {
              step2: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step3: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step4: {
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 0,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
            },
          )}
          dy='.35em'
        >
          Zuger Kantonalbank
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Kantonalbank Vaudoise') - 12,
              x: CENTER - 25,
              opacity: 0,
              textAnchor: 'end',
            },
            {
              step2: {
                y: getCostPosition('Kantonalbank Vaudoise') - 12,
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.5 },
                textAnchor: 'end',
              },
              step3: {
                y: getCostPosition('Kantonalbank Vaudoise') - 12,
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step4: {
                y: getCostPositionWithCS('Kantonalbank Vaudoise') - 12,
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 0,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
            },
          )}
          dy='.35em'
        >
          Waadtländer Kantonalbank
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Raiffeisen'),
              x: CENTER - 25,
              opacity: 0,
              textAnchor: 'end',
            },
            {
              step2: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1.5 },
                textAnchor: 'end',
              },
              step3: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
              step4: {
                y: getCostPositionWithCS('Raiffeisen'),
                x: CENTER - PADDING_LEFT_CHART - 25,
                opacity: 0,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'end',
              },
            },
          )}
          dy='.35em'
        >
          Raiffeisen
        </motion.text>

        {/* costs */}
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('UBS'),
              x: CENTER + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step1: {
                y: getCostPosition('UBS'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5 },
                textAnchor: 'start',
              },
              step2: {
                y: getCostPosition('UBS'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'start',
              },
              step3: {
                y: getCostPosition('UBS'),
                x: CENTER + 25,
                opacity: 0,
                transition: { duration: 0.5 },
                textAnchor: 'start',
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(getBankById(bankingLabelData, 'UBS').costs)}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Credit Suisse'),
              x: CENTER + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step1: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5 },
                textAnchor: 'start',
              },
              step2: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'start',
              },
              step3: {
                y: getCostPosition('Credit Suisse'),
                x: CENTER + 25,
                opacity: 0,
                transition: { duration: 0.5 },
                textAnchor: 'start',
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Credit Suisse').costs,
          )}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Zuger Kantonalbank'),
              x: CENTER + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step2: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
                textAnchor: 'start',
              },
              step3: {
                y: getCostPosition('Zuger Kantonalbank'),
                x: CENTER + 25,
                opacity: 0,
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Zuger Kantonalbank').costs,
          )}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Raiffeisen'),
              x: CENTER + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step2: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 1.5 },
                textAnchor: 'start',
              },
              step3: {
                y: getCostPosition('Raiffeisen'),
                x: CENTER + 25,
                opacity: 0,
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(getBankById(bankingLabelData, 'Raiffeisen').costs)}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getCostPosition('Kantonalbank Vaudoise') - 10,
              x: CENTER + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step2: {
                y: getCostPosition('Kantonalbank Vaudoise') - 10,
                x: CENTER + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.5 },
                textAnchor: 'start',
              },
              step3: {
                y: getCostPosition('Kantonalbank Vaudoise') - 10,
                x: CENTER + 25,
                opacity: 0,
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Kantonalbank Vaudoise').costs,
          )}
        </motion.text>

        {/* benefits */}
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getBenefitPosition('UBS'),
              x: CENTER + PADDING_LEFT_CHART + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step3: {
                y: getBenefitPosition('UBS'),
                x: CENTER + PADDING_LEFT_CHART + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 3.5 },
                textAnchor: 'start',
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(getBankById(bankingLabelData, 'UBS').benefit)}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getBenefitPositionWithCS('Credit Suisse'),
              x: CENTER + PADDING_LEFT_CHART + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step4: {
                y: getBenefitPositionWithCS('Credit Suisse'),
                x: CENTER + PADDING_LEFT_CHART + 25,
                opacity: 1,
                transition: { duration: 0.5, delay: 3.5 },
                textAnchor: 'start',
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Credit Suisse').benefit,
          )}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getBenefitPosition('Zuger Kantonalbank'),
              x: CENTER + PADDING_LEFT_CHART + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step3: {
                y: getBenefitPosition('Zuger Kantonalbank'),
                x: CENTER + PADDING_LEFT_CHART + 25,
                opacity: 1,
                textAnchor: 'start',
                transition: { duration: 0.5, delay: 3.5 },
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Zuger Kantonalbank').benefit,
          )}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getBenefitPosition('Raiffeisen') - 10,
              x: CENTER + PADDING_LEFT_CHART + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step3: {
                y: getBenefitPosition('Raiffeisen') - 10,
                x: CENTER + PADDING_LEFT_CHART + 25,
                opacity: 1,
                textAnchor: 'start',
                transition: { duration: 0.5, delay: 3.5 },
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Raiffeisen').benefit,
          )}
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            {
              y: getBenefitPosition('Kantonalbank Vaudoise'),
              x: CENTER + PADDING_LEFT_CHART + 25,
              opacity: 0,
              textAnchor: 'start',
            },
            {
              step3: {
                y: getBenefitPosition('Kantonalbank Vaudoise'),
                x: CENTER + PADDING_LEFT_CHART + 25,
                opacity: 1,
                textAnchor: 'start',
                transition: { duration: 0.5, delay: 3.5 },
              },
            },
          )}
          dy='.35em'
        >
          {formatOneDecimal(
            getBankById(bankingLabelData, 'Kantonalbank Vaudoise').benefit,
          )}
        </motion.text>
        {creditSuiseHistoricalData.map((d, i) => {
          return (
            <motion.circle
              key={`cs-history-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: chartRange[1] - costScaleAll(d.benefit),
                  x: CENTER + PADDING_LEFT_CHART,
                  opacity: 0,
                  r: 0,
                },
                {
                  step5: {
                    y: chartRange[1] - costScaleAll(d.benefit),
                    x: CENTER + PADDING_LEFT_CHART,
                    opacity: 1,
                    r: RADIUS,
                    fill: NEW_COLORS[key].two,
                  },
                },
              )}
            ></motion.circle>
          )
        })}
        {creditSuiseHistoricalData.map((d, i) => {
          return (
            <motion.circle
              key={`cs-history-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: chartRange[1] - costScaleAll(d.costs),
                  x: CENTER - PADDING_LEFT_CHART,
                  opacity: 0,
                  r: 0,
                },
                {
                  step5: {
                    y: chartRange[1] - costScaleAll(d.costs),
                    x: CENTER - PADDING_LEFT_CHART,
                    opacity: 1,
                    r: RADIUS,
                    fill: NEW_COLORS[key].two,
                  },
                },
              )}
            ></motion.circle>
          )
        })}
      </g>
    </motion.svg>
  )
}

const styles = {
  label: css({
    ...fontStyles.sansSerifRegular23,
    fontFeatureSettings: '"tnum", "kern"',
    [mediaQueries.onlyS]: {
      fontSize: '1.7rem',
    },
  }),
  axisTick: css({
    ...fontStyles.sansSerifRegular19,
    fontFeatureSettings: '"tnum", "kern"',
    [mediaQueries.onlyS]: {
      fontSize: '1.7rem',
    },
  }),
}
