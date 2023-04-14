import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import { scaleLinear, scaleBand } from 'd3-scale'

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

const PADDING_LEFT_CHART = 100
const WIDTH = 930
const CENTER = WIDTH / 2

const costDomainAll = [0, 257575]

const chartRange = [235, 0]

const costScaleAll = scaleLinear().domain(costDomainAll).range(chartRange)

const getBankById = (array, bank) => array.find((d) => d.bank === bank)

const getCostPositionWithCS = (bank) =>
  costScaleAll(getBankById(bankingPositionData, bank).costs)

const getBenefitPositionWithCS = (bank) =>
  costScaleAll(Math.abs(getBankById(bankingPositionData, bank).benefit))

const barPositionScale = scaleBand()
  .domain([
    'UBS',
    'Kantonalbank Vaudoise',
    'Credit Suisse',
    'Zuger Kantonalbank',
    'Raiffeisen',
  ])
  .range([PADDING_LEFT_CHART, 800])

const csHistoricalScale = scaleBand()
  .domain([
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    'Credit Suisse',
  ])
  .range([PADDING_LEFT_CHART, 800])

export const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
  const key = useResolvedColorSchemeKey()
  return (
    <motion.svg
      viewBox='0 0 930 360'
      preserveAspectRatio='xMidYMid meet'
      style={{ width: '100%' }}
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

      <g transform={`translate(${PADDING_LEFT}, ${50})`}>
        {/* costs  */}
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('UBS'),
              opacity: 0,
              fill: NEW_COLORS[key].one,
            },
            {
              step1: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('UBS'),
                y: getCostPositionWithCS('UBS'),
                x: barPositionScale('UBS'),
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
              step2: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('UBS'),
                y: getCostPositionWithCS('UBS'),
                x: barPositionScale('UBS'),
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
              step3: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('UBS'),
                y: getCostPositionWithCS('UBS'),
                x: barPositionScale('UBS'),
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
              step4: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('UBS'),
                y: getCostPositionWithCS('UBS'),
                x: barPositionScale('UBS'),
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Credit Suisse'),
              opacity: 0,
              fill: NEW_COLORS[key].two,
            },
            {
              step1: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Credit Suisse'),
                y: getCostPositionWithCS('Credit Suisse'),
                x: barPositionScale('Credit Suisse'),
                fill: NEW_COLORS[key].two,
                opacity: 1,
              },
              step2: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Credit Suisse'),
                y: getCostPositionWithCS('Credit Suisse'),
                x: barPositionScale('Credit Suisse'),
                fill: NEW_COLORS[key].two,
                opacity: 1,
              },
              step3: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Credit Suisse'),
                y: getCostPositionWithCS('Credit Suisse'),
                x: barPositionScale('Credit Suisse'),
                fill: NEW_COLORS[key].two,
                opacity: 1,
              },
              step4: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Credit Suisse'),
                y: getCostPositionWithCS('Credit Suisse'),
                x: barPositionScale('Credit Suisse'),
                fill: NEW_COLORS[key].two,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
              },
              step5: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Credit Suisse'),
                y: getCostPositionWithCS('Credit Suisse'),
                x: csHistoricalScale('Credit Suisse'),
                fill: NEW_COLORS[key].two,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Zuger Kantonalbank'),
              opacity: 0,
              fill: NEW_COLORS[key].three,
            },
            {
              step2: {
                width: 20,
                height:
                  chartRange[0] - getCostPositionWithCS('Zuger Kantonalbank'),
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: barPositionScale('Zuger Kantonalbank'),
                fill: NEW_COLORS[key].three,
                opacity: 1,
              },
              step3: {
                width: 20,
                height:
                  chartRange[0] - getCostPositionWithCS('Zuger Kantonalbank'),
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: barPositionScale('Zuger Kantonalbank'),
                fill: NEW_COLORS[key].three,
                opacity: 1,
              },
              step4: {
                width: 20,
                height:
                  chartRange[0] - getCostPositionWithCS('Zuger Kantonalbank'),
                y: getCostPositionWithCS('Zuger Kantonalbank'),
                x: barPositionScale('Zuger Kantonalbank'),
                fill: NEW_COLORS[key].three,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Kantonalbank Vaudoise'),
              opacity: 0,
              fill: NEW_COLORS[key].four,
            },
            {
              step2: {
                width: 20,
                height:
                  chartRange[0] -
                  getCostPositionWithCS('Kantonalbank Vaudoise'),
                y: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x: barPositionScale('Kantonalbank Vaudoise'),
                fill: NEW_COLORS[key].four,
                opacity: 1,
              },
              step3: {
                width: 20,
                height:
                  chartRange[0] -
                  getCostPositionWithCS('Kantonalbank Vaudoise'),
                y: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x: barPositionScale('Kantonalbank Vaudoise'),
                fill: NEW_COLORS[key].four,
                opacity: 1,
              },
              step4: {
                width: 20,
                height:
                  chartRange[0] -
                  getCostPositionWithCS('Kantonalbank Vaudoise'),
                y: getCostPositionWithCS('Kantonalbank Vaudoise'),
                x: barPositionScale('Kantonalbank Vaudoise'),
                fill: NEW_COLORS[key].four,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Raiffeisen'),
              opacity: 0,
              fill: NEW_COLORS[key].five,
            },
            {
              step2: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Raiffeisen'),
                y: getCostPositionWithCS('Raiffeisen'),
                x: barPositionScale('Raiffeisen'),
                fill: NEW_COLORS[key].five,
                opacity: 1,
              },
              step3: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Raiffeisen'),
                y: getCostPositionWithCS('Raiffeisen'),
                x: barPositionScale('Raiffeisen'),
                fill: NEW_COLORS[key].five,
                opacity: 1,
              },
              step4: {
                width: 20,
                height: chartRange[0] - getCostPositionWithCS('Raiffeisen'),
                y: getCostPositionWithCS('Raiffeisen'),
                x: barPositionScale('Raiffeisen'),
                fill: NEW_COLORS[key].five,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        {/* benefits */}
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('UBS') + 25,
              opacity: 0,
              fill: NEW_COLORS[key].one,
            },
            {
              step3: {
                width: 20,
                height: chartRange[0] - getBenefitPositionWithCS('UBS'),
                y: getBenefitPositionWithCS('UBS'),
                x: barPositionScale('UBS') + 25,
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
              step4: {
                width: 20,
                height: chartRange[0] - getBenefitPositionWithCS('UBS'),
                y: getBenefitPositionWithCS('UBS'),
                x: barPositionScale('UBS') + 25,
                fill: NEW_COLORS[key].one,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: costScaleAll(0),
              x: barPositionScale('Credit Suisse') + 25,
              opacity: 0,
              fill: NEW_COLORS[key].two,
            },
            {
              step4: {
                width: 20,
                height:
                  costScaleAll(0) - getBenefitPositionWithCS('Credit Suisse'),
                y: costScaleAll(0),
                x: barPositionScale('Credit Suisse') + 25,
                fill: NEW_COLORS[key].two,
                opacity: 1,
                transition: { duration: 0.5, delay: 1 },
              },
              step5: {
                width: 20,
                height:
                  costScaleAll(0) - getBenefitPositionWithCS('Credit Suisse'),
                y: costScaleAll(0),
                x: csHistoricalScale('Credit Suisse') + 25,
                fill: NEW_COLORS[key].two,
                opacity: 1,
                transition: { duration: 0.5 },
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Zuger Kantonalbank') + 25,
              opacity: 0,
              fill: NEW_COLORS[key].three,
            },
            {
              step3: {
                width: 20,
                height:
                  chartRange[0] -
                  getBenefitPositionWithCS('Zuger Kantonalbank'),
                y: getBenefitPositionWithCS('Zuger Kantonalbank'),
                x: barPositionScale('Zuger Kantonalbank') + 25,
                fill: NEW_COLORS[key].three,
                opacity: 1,
              },
              step4: {
                width: 20,
                height:
                  chartRange[0] -
                  getBenefitPositionWithCS('Zuger Kantonalbank'),
                y: getBenefitPositionWithCS('Zuger Kantonalbank'),
                x: barPositionScale('Zuger Kantonalbank') + 25,
                fill: NEW_COLORS[key].three,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Kantonalbank Vaudoise') + 25,
              opacity: 0,
              fill: NEW_COLORS[key].four,
            },
            {
              step3: {
                width: 20,
                height:
                  chartRange[0] -
                  getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                y: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                x: barPositionScale('Kantonalbank Vaudoise') + 25,
                fill: NEW_COLORS[key].four,
                opacity: 1,
              },
              step4: {
                width: 20,
                height:
                  chartRange[0] -
                  getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                y: getBenefitPositionWithCS('Kantonalbank Vaudoise'),
                x: barPositionScale('Kantonalbank Vaudoise') + 25,
                fill: NEW_COLORS[key].four,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        <motion.rect
          transition={{ duration: 0.5 }}
          variants={defineVariants(
            {
              width: 20,
              height: 0,
              y: chartRange[0],
              x: barPositionScale('Raiffeisen') + 25,
              opacity: 0,
              fill: NEW_COLORS[key].five,
            },
            {
              step3: {
                width: 20,
                height: chartRange[0] - getBenefitPositionWithCS('Raiffeisen'),
                y: getBenefitPositionWithCS('Raiffeisen'),
                x: barPositionScale('Raiffeisen') + 25,
                fill: NEW_COLORS[key].five,
                opacity: 1,
              },
              step4: {
                width: 20,
                height: chartRange[0] - getBenefitPositionWithCS('Raiffeisen'),
                y: getBenefitPositionWithCS('Raiffeisen'),
                x: barPositionScale('Raiffeisen') + 25,
                fill: NEW_COLORS[key].five,
                opacity: 1,
              },
            },
          )}
        ></motion.rect>
        {creditSuiseHistoricalData.map((d, i) => {
          return (
            <motion.rect
              key={`costs-${i}`}
              transition={{ duration: 1 }}
              variants={defineVariants(
                {
                  width: 20,
                  height: 0,
                  y: chartRange[0],
                  x: csHistoricalScale(d.year),
                  opacity: 0,
                  fill: NEW_COLORS[key].two,
                },
                {
                  step5: {
                    width: 20,
                    height: chartRange[0] - costScaleAll(d.costs),
                    y: costScaleAll(d.costs),
                    x: csHistoricalScale(d.year),
                    fill: NEW_COLORS[key].two,
                    opacity: 1,
                    transition: { duration: 1, delay: 1 },
                  },
                },
              )}
            ></motion.rect>
          )
        })}
        {creditSuiseHistoricalData.map((d, i) => {
          return (
            <motion.rect
              key={`costs-${i}`}
              transition={{ duration: 1 }}
              variants={defineVariants(
                {
                  width: 20,
                  height: 0,
                  y: d.benefit < 0 ? costScaleAll(0) : chartRange[0],
                  x: csHistoricalScale(d.year) + 25,
                  opacity: 0,
                  fill: NEW_COLORS[key].two,
                },
                {
                  step5: {
                    width: 20,
                    height:
                      d.benefit < 0
                        ? costScaleAll(0) - costScaleAll(-d.benefit)
                        : chartRange[0] - costScaleAll(d.benefit),
                    y:
                      d.benefit < 0 ? costScaleAll(0) : costScaleAll(d.benefit),
                    x: csHistoricalScale(d.year) + 25,
                    fill: NEW_COLORS[key].two,
                    opacity: 1,
                    transition: { duration: 1, delay: 1.5 },
                  },
                },
              )}
            ></motion.rect>
          )
        })}
      </g>
    </motion.svg>
  )
}

// {
//   width: 20,
//   height: 0,
//   y: costScaleAll(0),
//   x: barPositionScale('Credit Suisse') + 25,
//   opacity: 0,
//   fill: NEW_COLORS[key].two,
// },
// {
//   step4: {
//     width: 20,
//     height:
//       costScaleAll(0) - getBenefitPositionWithCS('Credit Suisse'),
//     y: costScaleAll(0),
//     x: barPositionScale('Credit Suisse') + 25,
//     fill: NEW_COLORS[key].two,
//     opacity: 1,
//     transition: { duration: 0.5, delay: 1 },
//   },

const styles = {
  label: css({
    ...fontStyles.sansSerifRegular23,
    fontFeatureSettings: '"tnum", "kern"',
    [mediaQueries.onlyS]: {
      fontSize: '1.7rem',
    },
  }),
}
