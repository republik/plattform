import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import {
  useColorContext,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import {
  dataSet,
  PADDING_TOP,
  PADDING_LEFT,
  SMALL_RADIUS,
  COLORS,
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
                    opacity: 1,
                    fill: i > 40 ? COLORS[key].default : COLORS[key].oneBright,
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 62 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i > 40 && i < 63
                        ? COLORS[key].oneBright
                        : i > 62
                        ? COLORS[key].default
                        : COLORS[key].one,
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 72 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i > 62 && i < 73
                        ? COLORS[key].oneBright
                        : i >= 73
                        ? COLORS[key].default
                        : COLORS[key].one,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 77 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i > 72 && i < 78
                        ? COLORS[key].oneBright
                        : i >= 78
                        ? COLORS[key].default
                        : COLORS[key].one,
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 82 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i > 77 && i < 83
                        ? COLORS[key].oneBright
                        : i >= 83
                        ? COLORS[key].default
                        : COLORS[key].one,
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
                    opacity: 1,
                    fill: i > 39 ? COLORS[key].default : COLORS[key].twoBright,
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 60 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.1 },
                    opacity: 1,
                    fill:
                      i > 39 && i < 61
                        ? COLORS[key].twoBright
                        : i >= 61
                        ? COLORS[key].default
                        : COLORS[key].two,
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 71 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.1 },
                    opacity: 1,
                    fill:
                      i > 60 && i < 72
                        ? COLORS[key].twoBright
                        : i >= 72
                        ? COLORS[key].default
                        : COLORS[key].two,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 76 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.1 },
                    opacity: 1,
                    fill:
                      i > 71 && i < 77
                        ? COLORS[key].twoBright
                        : i >= 77
                        ? COLORS[key].default
                        : COLORS[key].two,
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 81 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.1 },
                    opacity: 1,
                    fill:
                      i > 76 && i < 82
                        ? COLORS[key].twoBright
                        : i >= 82
                        ? COLORS[key].default
                        : COLORS[key].two,
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
                    opacity: 1,
                    fill:
                      i > 33 ? COLORS[key].default : COLORS[key].threeBright,
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 50 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.3 },
                    opacity: 1,
                    fill:
                      i >= 34 && i < 51
                        ? COLORS[key].threeBright
                        : i >= 50
                        ? COLORS[key].default
                        : COLORS[key].three,
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 59 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.3 },
                    opacity: 1,
                    fill:
                      i >= 51 && i < 60
                        ? COLORS[key].threeBright
                        : i >= 59
                        ? COLORS[key].default
                        : COLORS[key].three,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 63 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.3 },
                    opacity: 1,
                    fill:
                      i >= 60 && i < 64
                        ? COLORS[key].threeBright
                        : i >= 64
                        ? COLORS[key].default
                        : COLORS[key].three,
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 67 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.3 },
                    opacity: 1,
                    fill:
                      i >= 64 && i < 68
                        ? COLORS[key].threeBright
                        : i >= 68
                        ? COLORS[key].default
                        : COLORS[key].three,
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
                    opacity: 1,
                    fill: i > 17 ? COLORS[key].default : COLORS[key].fourBright,
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 26 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.5 },
                    fill:
                      i > 17 && i < 27
                        ? COLORS[key].fourBright
                        : i >= 27
                        ? COLORS[key].default
                        : COLORS[key].four,
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 30 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.5 },
                    fill:
                      i > 26 && i < 31
                        ? COLORS[key].fourBright
                        : i >= 31
                        ? COLORS[key].default
                        : COLORS[key].four,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 33 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.5 },
                    opacity: 1,
                    fill:
                      i > 30 && i < 34
                        ? COLORS[key].fourBright
                        : i >= 34
                        ? COLORS[key].default
                        : COLORS[key].four,
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i > 35 ? SMALL_RADIUS : d.r,
                    transition: { duration: 0.5, delay: 0.5 },
                    opacity: 1,
                    fill:
                      i > 33 && i < 36
                        ? COLORS[key].fourBright
                        : i >= 36
                        ? COLORS[key].default
                        : COLORS[key].four,
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
