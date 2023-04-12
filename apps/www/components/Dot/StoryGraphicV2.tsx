import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import { scaleThreshold, scaleBand } from 'd3-scale'

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
  RADIUS,
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
  }
  return 'step0'
}

const CENTER = 930 / 2
const OFFSET = 105

const TRANSFERS = [
  '1. Transfer',
  '2. Transfer',
  '3. Transfer',
  '4. Transfer',
  'Mehr als 4',
]

const DELAY_TIMES = [1, 1.5, 2, 2.5, 3]
const BELOW_34_THRESHOLDS = [40, 61, 72, 77, 82]
const BELOW_40_THRESHOLDS = [34, 51, 60, 64, 68]
const ABOVE_40_THRESHOLDS = [18, 27, 31, 34, 36]

const below34AnimationScale = scaleThreshold()
  .domain(BELOW_34_THRESHOLDS)
  .range(DELAY_TIMES)

const transferAnimationScale = scaleThreshold()
  .domain([1, 2, 3, 4, 5])
  .range(DELAY_TIMES)

const below34ColorScale = scaleThreshold()
  .domain(BELOW_34_THRESHOLDS)
  .range(['one100', 'one200', 'one300', 'one400', 'one500'])

const below40ColorScale = scaleThreshold()
  .domain(BELOW_40_THRESHOLDS)
  .range(['two100', 'two200', 'two300', 'two400', 'two500'])

const above40ColorScale = scaleThreshold()
  .domain(ABOVE_40_THRESHOLDS)
  .range(['three100', 'three200', 'three300', 'three400', 'three500'])

const getDelayBelow40 = (index: number) => {
  if (index < 34) return 1
  if (index >= 34 && index < 51) return 1.5
  if (index >= 51 && index < 60) return 2
  if (index >= 60 && index < 64) return 2.5
  if (index >= 64 && index < 68) return 3
  return 0
}

const getDelayAbove40 = (index: number) => {
  if (index < 18) return 1
  if (index > 17 && index < 27) return 1.5
  if (index > 26 && index < 31) return 2
  if (index > 30 && index < 34) return 2.5
  if (index > 33 && index < 36) return 3
  return 0
}

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

      {/* second age group, 30 to 34 */}
      <motion.g
        variants={defineVariants(
          {
            x: CENTER - OFFSET,
            y: PADDING_TOP,
          },
          {
            step3: {
              x: CENTER - OFFSET,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
            step4: {
              x: CENTER + 150,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
          },
        )}
      >
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age40-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  r: SMALL_RADIUS,
                  opacity: 1,
                  fill: COLORS[key].default,
                },
                {
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 36 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 36
                        ? COLORS[key].default
                        : COLORS[key][above40ColorScale(i)],
                    transition: { duration: 0.5, delay: getDelayAbove40(i) },
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 36 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill: i >= 36 ? COLORS[key].default : COLORS[key].oneBright,
                    transition: { duration: 0.5, delay: getDelayAbove40(i) },
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
              step3: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step4: {
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
      </motion.g>
      <motion.g
        variants={defineVariants(
          {
            x: CENTER - OFFSET,
            y: PADDING_TOP,
          },
          {},
        )}
      >
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            { x: OFFSET, y: -50, opacity: 0 },
            {
              step1: {
                x: OFFSET,
                y: -50,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: OFFSET,
                y: -50,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step3: {
                x: OFFSET,
                y: -50,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step4: {
                x: OFFSET,
                y: -50,
                opacity: 1,
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          kumulative Schwangerschaftsrate
        </motion.text>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age34-39-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  r: SMALL_RADIUS,
                  opacity: 1,
                  fill: COLORS[key].default,
                },
                {
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 68
                        ? COLORS[key].default
                        : COLORS[key][below40ColorScale(i)],
                    transition: { duration: 0.5, delay: getDelayBelow40(i) },
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                    fill:
                      i >= 68 ? COLORS[key].default : COLORS[key].threeBright,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 68 ? COLORS[key].default : COLORS[key].threeBright,
                    transition: { duration: 0.5 },
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
              step2: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 0,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          35–39 Jahre
        </motion.text>
      </motion.g>
      <motion.g
        variants={defineVariants(
          {
            x: CENTER - OFFSET,
            y: PADDING_TOP,
          },
          {
            step3: {
              x: CENTER - OFFSET,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
            step4: {
              x: CENTER - 360,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
          },
        )}
      >
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-age30-34-${i}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  r: SMALL_RADIUS,
                  opacity: 1,
                  fill: COLORS[key].default,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 82
                        ? COLORS[key].default
                        : COLORS[key][below34ColorScale(i)],
                    transition: {
                      duration: 0.5,
                      delay: below34AnimationScale(i),
                    },
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 1,

                    transition: { duration: 0.5 },
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
                opacity: 0,
              },
              step3: {
                x: 5,
                y: 225,
                opacity: 0,
              },
              step4: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
          dy='.35em'
          transition={{ duration: 0.5 }}
        >
          30–34 Jahre
        </motion.text>

        {/* labels */}
        <motion.g
          variants={defineVariants(
            {
              x: 250,
              y: 10,
            },
            {},
          )}
        >
          {TRANSFERS.map((d, i) => {
            return (
              <motion.g
                key={`34-${d}`}
                {...styles.label}
                {...colorScheme.set('fill', 'text')}
                variants={defineVariants(
                  {
                    x: 0,
                    y: 35 * i,
                    opacity: 0,
                  },
                  {
                    step1: {
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: transferAnimationScale(i),
                      },
                    },
                  },
                )}
              >
                <motion.circle
                  variants={defineVariants(
                    {
                      r: RADIUS,
                      y: -RADIUS,
                      x: -RADIUS,
                      fill: COLORS[key][`one${i + 1}00`],
                    },
                    {},
                  )}
                ></motion.circle>
                <motion.text
                  variants={defineVariants(
                    {
                      y: 0,
                      x: 10,
                    },
                    {},
                  )}
                >
                  {d}
                </motion.text>
              </motion.g>
            )
          })}
          {TRANSFERS.map((d, i) => {
            return (
              <motion.g
                key={`39-${d}`}
                {...styles.label}
                {...colorScheme.set('fill', 'text')}
                variants={defineVariants(
                  {
                    x: 0,
                    y: 35 * i,
                    opacity: 0,
                  },
                  {
                    step2: {
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: transferAnimationScale(i),
                      },
                    },
                  },
                )}
              >
                <motion.circle
                  variants={defineVariants(
                    {
                      r: RADIUS,
                      y: -RADIUS,
                      x: -RADIUS,
                      fill: COLORS[key][`two${i + 1}00`],
                    },
                    {},
                  )}
                ></motion.circle>
                <motion.text
                  variants={defineVariants(
                    {
                      y: 0,
                      x: 10,
                    },
                    {},
                  )}
                >
                  {d}
                </motion.text>
              </motion.g>
            )
          })}
          {TRANSFERS.map((d, i) => {
            return (
              <motion.g
                key={`40-${d}`}
                {...styles.label}
                {...colorScheme.set('fill', 'text')}
                variants={defineVariants(
                  {
                    x: 0,
                    y: 35 * i,
                    opacity: 0,
                  },
                  {
                    step3: {
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: transferAnimationScale(i),
                      },
                    },
                  },
                )}
              >
                <motion.circle
                  variants={defineVariants(
                    {
                      r: RADIUS,
                      y: -RADIUS,
                      x: -RADIUS,
                      fill: COLORS[key][`three${i + 1}00`],
                    },
                    {},
                  )}
                ></motion.circle>
                <motion.text
                  variants={defineVariants(
                    {
                      y: 0,
                      x: 10,
                    },
                    {},
                  )}
                >
                  {d}
                </motion.text>
              </motion.g>
            )
          })}
        </motion.g>
      </motion.g>
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
