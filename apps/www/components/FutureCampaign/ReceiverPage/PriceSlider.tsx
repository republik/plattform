import {
  SLIDER_STEPS,
  SLIDER_STEP_VALUES,
  SLIDER_TRANSITION,
} from '../constants'
import { useEffect, useMemo, useRef, useState } from 'react'
import { scalePoint } from 'd3'

import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'

const styles = {
  container: css({
    position: 'relative',
    width: '3rem',
    height: 400,
  }),
  track: css({
    position: 'absolute',
    top: 0,
    left: '50%',
    height: '100%',
    width: 10,
    marginLeft: -5,
  }),
  trackFill: css({
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 10,
    marginLeft: -5,
  }),
  tick: css({
    cursor: 'pointer',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: '-1rem',
    left: '.5rem',
    borderRadius: '100vw',
    fontSize: '0.6em',
    color: 'white',
  }),
  thumb: css({
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '2rem',
    height: '2rem',
    background: 'white',
    border: `5px solid transparent`,
    borderRadius: '100vw',
    // transform: `translate(0, -1.5rem)`,
    // marginLeft: "-1.5rem",
    marginTop: '-1rem',
    marginLeft: '-1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2em',
  }),
}

const useSliderStuff = (sliderHeight = 400) => {
  return useMemo(() => {
    // Scales
    const sliderScale = scalePoint(
      Array.from({ length: SLIDER_STEP_VALUES.length }, (_, i) => i),
      [0, sliderHeight],
    )

    const getStepAtY = (d: number) => {
      const i = isNaN(d)
        ? 0
        : Math.min(
            SLIDER_STEP_VALUES.length - 1,
            Math.max(0, Math.round(d / sliderScale.step())),
          )

      const val = SLIDER_STEP_VALUES[i]

      const step = SLIDER_STEPS[val.step]

      return {
        pos: i,
        value: val.value,
        label: step.label,
        text: step.text,
      }
    }

    const getStepAtPos = (pos: number) => {
      const val = SLIDER_STEP_VALUES[pos]

      const step = SLIDER_STEPS[val.step]

      return {
        pos,
        value: val.value,
        label: step.label,
        text: step.text,
      }
    }

    const ticks = SLIDER_STEP_VALUES.flatMap((d, i) => {
      return d.tick
        ? [
            {
              pos: i,
              ...d,
            },
          ]
        : []
    })

    return { sliderScale, getStepAtY, getStepAtPos, ticks }
  }, [sliderHeight])
}

type PriceSliderProps = {
  onChange: (price: number) => void
}

export const PriceSlider = ({ onChange }: PriceSliderProps) => {
  const { sliderScale, getStepAtY, getStepAtPos, ticks } = useSliderStuff()

  const [colorScheme] = useColorContext()

  const trackRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimationControls()
  const y = useMotionValue(100)

  // OK, OK, this is weird and we shouldn't create hooks in a loop but we rely on the fact that the number of ticks doesn't change. If there were a way to pass arguments to a MotionValue, this wouldn't be necessary.
  const tickBackgrounds = []
  for (const tick of ticks) {
    tickBackgrounds.push(
      // eslint-disable-next-line
      useTransform(y, (yval) =>
        getStepAtY(yval).value > tick.value
          ? colorScheme.getCSSColor('primary')
          : colorScheme.getCSSColor('disabled'),
      ),
    )
  }

  const [displayVal, setDisplayVal] = useState(getStepAtPos(26))

  useEffect(() => {
    animationControls.start({
      y: sliderScale(26),
      transition: { ...SLIDER_TRANSITION, duration: 1 },
    })
  }, [])

  const gotoPos = (pos: number) => {
    if (displayVal !== getStepAtPos(pos)) {
      animationControls.start({
        y: sliderScale(pos),
        transition: { ...SLIDER_TRANSITION, duration: 0.3 },
      })

      const step = getStepAtPos(pos)
      setDisplayVal(step)
      onChange(step.value)
    }
  }

  return (
    <>
      <div {...styles.container} ref={trackRef} data-id='price-slider'>
        <div
          {...styles.track}
          {...colorScheme.set('background', 'disabled')}
        ></div>

        <motion.div
          {...styles.trackFill}
          {...colorScheme.set('background', 'primary')}
          style={{ height: y }}
        ></motion.div>

        {ticks.map((tick, i) => {
          return (
            <motion.div
              key={tick.value}
              {...styles.tick}
              style={{
                top: sliderScale(tick.pos),
                background: tickBackgrounds[i],
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                gotoPos(tick.pos)
              }}
            >
              <div>{tick.value}</div>
            </motion.div>
          )
        })}

        <motion.div
          style={{
            y,
            scale: 1,
            // transformOrigin: "50% 50%",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.5 }}
          whileDrag={{ scale: 1.5 }}
          animate={animationControls}
          transition={SLIDER_TRANSITION}
          drag='y'
          dragConstraints={{ top: 0, bottom: 400 }}
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info) => {
            if (trackRef.current) {
              const y =
                info.point.y -
                trackRef.current.getBoundingClientRect().y -
                window.scrollY

              const step = getStepAtY(y)
              if (step.pos !== displayVal.pos) {
                // console.log(step);
                setDisplayVal(step)
                onChange(step.value)
              }
            }
          }}
          onDragEnd={(e, info) => {
            if (trackRef.current) {
              const y =
                info.point.y -
                trackRef.current.getBoundingClientRect().y -
                window.scrollY
              // console.log(y);

              const step = getStepAtY(y)

              setDisplayVal(step)
              onChange(step.value)

              animationControls.start({
                y: sliderScale(step.pos),
                scale: 1,
                transition: {
                  delay: 0.01, // add slight delay, otherwise it interferes with drag
                },
              })
            }
          }}
        >
          <div {...styles.thumb} {...colorScheme.set('borderColor', 'primary')}>
            <svg
              width='18'
              height='16'
              viewBox='0 0 18 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                y='0.84375'
                width='18'
                height='3'
                rx='1.5'
                fill='black'
                fillOpacity='0.2'
              />
              <rect
                y='6.84375'
                width='18'
                height='3'
                rx='1.5'
                fill='black'
                fillOpacity='0.2'
              />
              <rect
                y='12.8438'
                width='18'
                height='3'
                rx='1.5'
                fill='black'
                fillOpacity='0.2'
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </>
  )
}
