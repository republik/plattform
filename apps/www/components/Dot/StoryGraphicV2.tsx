import { motion, Variant } from 'framer-motion'

import { css } from 'glamor'

import { scaleThreshold } from 'd3-scale'

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
  SIZE,
} from './config'
import { useResolvedColorSchemeKey } from '../ColorScheme/lib'
import { useAnimatedValue, useMotionValueTextContent } from './useAnimatedValue'

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

const CENTER = 700 / 2
const OFFSET = 5 * SIZE

const TRANSFERS = ['1', '2', '3', '4', 'Mehr als 4']

const DELAY_TIMES = [0.5, 1.5, 2.5, 3.5, 4.5]
const BELOW_34_THRESHOLDS = [40, 61, 72, 77, 82]
const BELOW_40_THRESHOLDS = [34, 51, 60, 64, 68]
const ABOVE_40_THRESHOLDS = [18, 27, 31, 34, 36]

const below34AnimationScale = scaleThreshold()
  .domain(BELOW_34_THRESHOLDS)
  .range(DELAY_TIMES)

const below40AnimationScale = scaleThreshold()
  .domain(BELOW_40_THRESHOLDS)
  .range(DELAY_TIMES)

const above40AnimationScale = scaleThreshold()
  .domain(ABOVE_40_THRESHOLDS)
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

export const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  const [colorScheme] = useColorContext()
  const key = useResolvedColorSchemeKey()

  const count = useAnimatedValue({
    initialValue: 0,
    transition: { duration: 4.5, delay: 1 },
    value: 0,
  })

  const count1 = useAnimatedValue({
    initialValue: 0,
    transition: { duration: 4.5, delay: 1 },
    value: getVariant(highlighted) === 'step2' ? 82 : 0,
  })

  const count2 = useAnimatedValue({
    initialValue: 0,
    transition: { duration: 4.5, delay: 0.5 },
    value: getVariant(highlighted) === 'step3' ? 68 : 0,
  })

  const count3 = useAnimatedValue({
    initialValue: 0,
    transition: { duration: 4.5, delay: 0.5 },
    value: getVariant(highlighted) === 'step4' ? 36 : 0,
  })

  const animatedValueRef1 = useMotionValueTextContent(count1)
  const animatedValueRef2 = useMotionValueTextContent(count2)
  const animatedValueRef3 = useMotionValueTextContent(count3)

  return (
    <motion.svg
      viewBox='0 0 700 400'
      preserveAspectRatio='xMidYMid meet'
      style={{
        width: '100%',
      }}
      {...colorScheme.set('background-color', 'transparentBackground')}
      initial='step0'
      animate={getVariant(highlighted)}
    >
      {/* second age group, 40 plus */}
      <motion.g
        variants={defineVariants(
          {
            x: CENTER - OFFSET,
            y: PADDING_TOP,
          },
          {
            step4: {
              x: CENTER - OFFSET,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
            step5: {
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
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 36 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 36
                        ? COLORS[key].default
                        : COLORS[key][above40ColorScale(i)],
                    transition: {
                      duration: 0.5,
                      delay: above40AnimationScale(i),
                    },
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 36 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 36
                        ? COLORS[key].default
                        : COLORS[key][above40ColorScale(i)],
                    transition: {
                      duration: 0.5,
                      delay: above40AnimationScale(i),
                    },
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
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
              },
            },
          )}
          transition={{ duration: 0.5 }}
        >
          über 40 Jahre
        </motion.text>
      </motion.g>
      <motion.g
        variants={defineVariants(
          {
            x: CENTER,
            y: PADDING_TOP,
          },
          {
            step5: {
              x: CENTER,
              y: PADDING_TOP,
            },
          },
        )}
      >
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            { x: 0, y: -30, opacity: 1 },
            {
              step1: {
                x: 0,
                y: -30,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 0,
                y: -30,
                opacity: 0,
                transition: { duration: 0.5 },
              },
              step3: {
                x: 0,
                y: -30,
                opacity: 0,
                transition: { duration: 0.5 },
              },
              step4: {
                x: 0,
                y: -30,
                opacity: 0,
                transition: { duration: 0.5 },
              },
              step5: {
                x: 0,
                y: -30,
                opacity: 0,
                transition: { duration: 0.5 },
              },
            },
          )}
          transition={{ duration: 0.5 }}
        >
          100 Frauen wollen schwanger werden per In-Vitro-Fertilisation
        </motion.text>
        <motion.text
          {...styles.label}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            {
              x: 0,
              y: -30,
              opacity: 0,
            },
            {
              step2: {
                opacity: 1,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
              step3: {
                opacity: 0,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
            },
          )}
        >
          <tspan ref={animatedValueRef1}></tspan> von 100 Frauen im Alter von
          30–34 Jahren sind schwanger
        </motion.text>
        <motion.text
          {...styles.label}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            {
              x: 0,
              y: -30,
              opacity: 0,
            },
            {
              step3: {
                opacity: 1,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
              step4: {
                opacity: 0,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
            },
          )}
        >
          <tspan ref={animatedValueRef2}></tspan> von 100 Frauen im Alter von
          35–39 Jahren sind schwanger
        </motion.text>
        <motion.text
          {...styles.label}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            {
              x: 0,
              y: -30,
              opacity: 0,
            },
            {
              step4: {
                opacity: 1,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
              step5: {
                opacity: 0,
                x: 0,
                y: -30,
                transition: {
                  duration: 0.5,
                },
              },
            },
          )}
        >
          <tspan ref={animatedValueRef3}></tspan> von 100 Frauen über 40 Jahren
          sind schwanger
        </motion.text>
        <motion.text
          {...styles.label}
          {...colorScheme.set('fill', 'text')}
          style={{ textAnchor: 'middle' }}
          variants={defineVariants(
            { x: 0, y: -30, opacity: 0 },
            {
              step5: {
                x: 1,
                y: -30,
                opacity: 1,
                transition: { duration: 0.5 },
              },
            },
          )}
          transition={{ duration: 0.5 }}
        >
          Kumulative Schwangerschaftsrate nach Altersgruppe
        </motion.text>
        {/* <motion.text
          {...styles.label}
          style={{ textAnchor: 'middle' }}
          {...colorScheme.set('fill', 'text')}
          variants={defineVariants(
            { x: 0, y: -60, opacity: 0 },
            {
              step2: {
                x: 0,
                y: -60,
                opacity: 1,
                transition: { duration: 0.5 },
              },
              step3: {
                x: 0,
                y: -60,
                opacity: 0,
                transition: { duration: 0.5 },
              },
            },
          )}
          transition={{ duration: 0.5 }}
        >
          <tspan>Die Wahrscheinlichkeit auf eine Schwangerschaft</tspan>
          <tspan x='0' dy='30'>
            steigt bei mehreren Versuchen.
          </tspan>
        </motion.text> */}
      </motion.g>
      <motion.g
        variants={defineVariants(
          {
            x: CENTER - OFFSET,
            y: PADDING_TOP,
          },
          {
            step5: {
              x: CENTER - OFFSET,
              y: PADDING_TOP,
            },
          },
        )}
      >
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
                  opacity: 0,
                  fill: COLORS[key].default,
                },
                {
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 68
                        ? COLORS[key].default
                        : COLORS[key][below40ColorScale(i)],
                    transition: {
                      duration: 0.5,
                      delay: below40AnimationScale(i),
                    },
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                    fill:
                      i >= 68
                        ? COLORS[key].default
                        : COLORS[key][below40ColorScale(i)],
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 68 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 68
                        ? COLORS[key].default
                        : COLORS[key][below40ColorScale(i)],
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
              step5: {
                x: 5,
                y: 225,
                opacity: 1,
                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
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
            step4: {
              x: CENTER - OFFSET,
              y: PADDING_TOP,
              transition: { duration: 0.5 },
            },
            step5: {
              x: 0,
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
                  opacity: 0,
                  fill: COLORS[key].default,
                },
                {
                  step2: {
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
                      delay: 0.5 + below34AnimationScale(i),
                    },
                  },
                  step3: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                    fill:
                      i >= 82
                        ? COLORS[key].default
                        : COLORS[key][below34ColorScale(i)],
                  },
                  step4: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 0,
                    fill:
                      i >= 82
                        ? COLORS[key].default
                        : COLORS[key][below34ColorScale(i)],
                  },
                  step5: {
                    y: d.cy,
                    x: d.cx,
                    r: i >= 82 ? SMALL_RADIUS : d.r,
                    opacity: 1,
                    fill:
                      i >= 82
                        ? COLORS[key].default
                        : COLORS[key][below34ColorScale(i)],
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
                opacity: 0,
                transition: { duration: 0.5 },
              },
              step2: {
                x: 5,
                y: 225,
                opacity: 0,
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
                opacity: 0,
              },
              step5: {
                x: 5,
                y: 225,
                opacity: 1,

                transition: { duration: 0.5, delay: 0.5 },
              },
            },
          )}
          transition={{ duration: 0.5 }}
        >
          30–34 Jahre
        </motion.text>

        {/* labels */}
        <motion.g
          variants={defineVariants(
            {
              x: 0,
              y: 230,
            },
            {},
          )}
        >
          <motion.text
            {...styles.label}
            style={{ textAnchor: 'middle' }}
            {...colorScheme.set('fill', 'text')}
            variants={defineVariants(
              {
                x: 95,
                y: 0,
                opacity: 0,
              },
              {
                step2: {
                  x: 95,
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                  },
                },
                step3: {
                  x: 95,
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                  },
                },
                step4: {
                  x: 95,
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                  },
                },
              },
            )}
          >
            Embryonentransfers
          </motion.text>
          {TRANSFERS.map((d, i) => {
            return (
              <motion.g
                key={`34-${d}`}
                {...styles.label}
                {...colorScheme.set('fill', 'text')}
                variants={defineVariants(
                  {
                    x: -50 + 50 * i,
                    y: 35,
                    opacity: 0,
                  },
                  {
                    step2: {
                      x: -50 + 50 * i,
                      y: 35,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: 0.5 + transferAnimationScale(i),
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
                    x: -50 + 50 * i,
                    y: 35,
                    opacity: 0,
                  },
                  {
                    step3: {
                      x: -50 + 50 * i,
                      y: 35,
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
                    x: -50 + 50 * i,
                    y: 35,
                    opacity: 0,
                  },
                  {
                    step4: {
                      x: -50 + 50 * i,
                      y: 35,
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
