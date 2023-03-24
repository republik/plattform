import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import {
  useColorContext,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import { dataSet, PADDING_TOP, PADDING_LEFT, SMALL_RADIUS } from './config'

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

export const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
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

      {/* first age group, below 29 */}
      <g transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age-29-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  r: 0,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 40 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill: i > 40 ? '#737373' : '#0dcbc8',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 62 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 40 && i < 63
                        ? '#0dcbc8'
                        : i > 62
                        ? '#737373'
                        : '#376867',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 72 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 62 && i < 73
                        ? '#0dcbc8'
                        : i >= 73
                        ? '#737373'
                        : '#376867',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 77 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 72 && i < 78
                        ? '#0dcbc8'
                        : i >= 78
                        ? '#737373'
                        : '#376867',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 82 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 77 && i < 83
                        ? '#0dcbc8'
                        : i >= 83
                        ? '#737373'
                        : '#376867',
                  },
                },
              )}
            ></motion.circle>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 5, y: 225, opacity: 0 },
            {
              step1: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          unter 30 Jahren
        </motion.text>
      </g>

      {/* second age group, 30 to 34 */}
      <g transform={`translate(${235}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age30-34-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                  r: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 39 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill: i > 39 ? '#737373' : '#b743ff',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 60 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 39 && i < 61
                        ? '#b743ff'
                        : i >= 61
                        ? '#737373'
                        : '#8b63a4',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 71 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 60 && i < 72
                        ? '#b743ff'
                        : i >= 72
                        ? '#737373'
                        : '#8b63a4',
                    // fill: i >= 72 ? '#737373' : '#8b63a4',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 76 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 71 && i < 77
                        ? '#b743ff'
                        : i >= 77
                        ? '#737373'
                        : '#8b63a4',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 81 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 76 && i < 82
                        ? '#b743ff'
                        : i >= 82
                        ? '#737373'
                        : '#8b63a4',
                  },
                },
              )}
            ></motion.circle>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 5, y: 225, opacity: 0 },
            {
              step1: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          30–34 Jahre
        </motion.text>
      </g>

      {/* third age group, 35 to 39 */}
      <g transform={`translate(${470}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age35-39-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                  r: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 33 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill: i > 33 ? '#737373' : '#fa9e1e',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 50 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i >= 34 && i < 51
                        ? '#fa9e1e'
                        : i >= 50
                        ? '#737373'
                        : '#9b794a',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 59 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i >= 51 && i < 60
                        ? '#fa9e1e'
                        : i >= 59
                        ? '#737373'
                        : '#9b794a',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 63 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i >= 60 && i < 64
                        ? '#fa9e1e'
                        : i >= 64
                        ? '#737373'
                        : '#9b794a',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 67 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i >= 64 && i < 68
                        ? '#fa9e1e'
                        : i >= 68
                        ? '#737373'
                        : '#9b794a',
                  },
                },
              )}
            ></motion.circle>
          )
        })}
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 5, y: 225, opacity: 0 },
            {
              step1: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          35–39 Jahre
        </motion.text>
      </g>

      {/* fourth age group, greater than 40 */}
      <g transform={`translate(${705}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age-40-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  opacity: 0,
                  r: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 17 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill: i > 17 ? '#737373' : '#00d5ff',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 26 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 17 && i < 27
                        ? '#00d5ff'
                        : i >= 27
                        ? '#737373'
                        : '#5c8f99',
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 30 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 26 && i < 31
                        ? '#00d5ff'
                        : i >= 31
                        ? '#737373'
                        : '#5c8f99',
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 33 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 30 && i < 34
                        ? '#00d5ff'
                        : i >= 34
                        ? '#737373'
                        : '#5c8f99',
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 35 ? SMALL_RADIUS : d.r,
                    // width: d.r,
                    // height: d.r,
                    opacity: 1,
                    fill:
                      i > 33 && i < 36
                        ? '#00d5ff'
                        : i >= 36
                        ? '#737373'
                        : '#5c8f99',
                  },
                },
              )}
            ></motion.circle>
          )
        })}

        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 5, y: 225, opacity: 0 },
            {
              step1: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
              },
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          über 40 Jahre
        </motion.text>
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
