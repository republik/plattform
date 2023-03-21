import { scalePoint } from 'd3-scale'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { SLIDER_TRANSITION, SLIDER_VALUES } from './config'

import { fontStyles, useColorContext } from '@project-r/styleguide'
import {
  motion,
  MotionValue,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { css } from 'glamor'
import {
  getFirstSliderStep,
  getLastSliderStep,
  getNextSliderStep,
  getPreviousSliderStep,
  getSliderStep,
  getSliderStepAtPosition,
  SliderValue,
} from './helpers'

const styles = {
  container: css({
    position: 'relative',
    width: 64,
    height: '100%',
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
    ...fontStyles.sansSerifMedium,
    cursor: 'pointer',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: -18,
    left: '50%',
    marginLeft: -18,
    borderRadius: '100vw',
    color: 'white',
    fontSize: 12,
    userSelect: 'none',
  }),
  tickDefault: css({
    color: 'black',
    height: 28,
    marginTop: -14,
  }),
  thumb: css({
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 42,
    height: 42,
    background: 'white',
    borderWidth: 4,
    borderStyle: 'solid',
    borderRadius: '100vw',
    // transform: `translate(0, -1.5rem)`,
    // marginLeft: "-1.5rem",
    marginTop: -21,
    marginLeft: -21,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

const minValue = getFirstSliderStep().value
const maxValue = getLastSliderStep().value

const useSliderStuff = (sliderHeight = 400) => {
  return useMemo(() => {
    // Scales
    const sliderScale = scalePoint(
      SLIDER_VALUES.map((v) => v.position),
      [0, sliderHeight],
    )

    const getStepAtY = (d: number) => {
      const i = isNaN(d)
        ? 0
        : Math.min(
            SLIDER_VALUES.length - 1,
            Math.max(0, Math.round(d / sliderScale.step())),
          )
      return getSliderStepAtPosition(i)
    }

    const ticks = SLIDER_VALUES.filter((d) => {
      return d.tick
    })

    return { sliderScale, getStepAtY, ticks }
  }, [sliderHeight])
}

type PriceSliderProps = {
  initialStep: SliderValue
  step: SliderValue
  height: number
  onChange: (step: SliderValue) => void
}

const Tick = ({
  sliderY,
  tickY,
  tick,
  onClick,
}: {
  sliderY: MotionValue
  tickY: number
  tick: SliderValue
  onClick: MouseEventHandler<HTMLDivElement>
}) => {
  const [colorScheme] = useColorContext()

  const background = useTransform(sliderY, (value) =>
    tick.isAverage
      ? '#F0DC28'
      : value > tickY
      ? colorScheme.getCSSColor('primary')
      : colorScheme.getCSSColor('disabled'),
  )

  return (
    <motion.div
      {...(tick.isAverage ? css(styles.tick, styles.tickDefault) : styles.tick)}
      style={{
        y: tickY,
        background,
      }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      <div>{tick.value}</div>
    </motion.div>
  )
}

export const PriceSlider = ({
  initialStep,
  step: currentStep,
  height,
  onChange,
}: PriceSliderProps) => {
  const { sliderScale, getStepAtY, ticks } = useSliderStuff(height)

  const [colorScheme] = useColorContext()

  const trackRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimationControls()
  const y = useMotionValue(0)

  useEffect(() => {
    animationControls.start({
      y: sliderScale(initialStep.position),
      transition: { ...SLIDER_TRANSITION, duration: 1 },
    })
  }, [initialStep])

  useEffect(() => {
    if (!y.isAnimating()) {
      y.set(sliderScale(currentStep.position))
    }
  }, [height, currentStep])

  const gotoPos = (pos: number) => {
    if (currentStep !== getSliderStepAtPosition(pos)) {
      animationControls.start({
        y: sliderScale(pos),
        transition: { ...SLIDER_TRANSITION, duration: 0.3 },
      })

      const step = getSliderStepAtPosition(pos)
      // setCurrentStep(step)
      onChange(step)
    }
  }

  /**
   * Keyboard interaction to ensure users can operate
   * the slider using only their keyboard.
   */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const keyMap: Record<string, React.KeyboardEventHandler> = {
        ArrowUp: () => gotoPos(getPreviousSliderStep(currentStep).position),
        ArrowDown: () => gotoPos(getNextSliderStep(currentStep).position),
        // PageUp: () => actions.stepUp(tenSteps),
        // PageDown: () => actions.stepDown(tenSteps),
        Home: () => gotoPos(getFirstSliderStep().position),
        End: () => gotoPos(getLastSliderStep().position),
      }

      const action = keyMap[event.key]

      if (action) {
        event.preventDefault()
        event.stopPropagation()
        action(event)
      }
    },
    [onChange, getSliderStep],
  )
  return (
    <>
      <div
        {...styles.container}
        ref={trackRef}
        data-id='price-slider'
        key={`h-${height}`} // rerender content when slider resizes to re-initialize drag behavior
      >
        <div
          {...styles.track}
          {...colorScheme.set('background', 'disabled')}
        ></div>

        <motion.div
          {...styles.trackFill}
          {...colorScheme.set('background', 'primary')}
          style={{ height: y }}
        ></motion.div>

        {ticks.map((tick) => {
          return (
            <Tick
              key={tick.position}
              tick={tick}
              tickY={sliderScale(tick.position)}
              sliderY={y}
              onClick={() => {
                gotoPos(tick.position)
              }}
            />
          )
        })}

        <motion.div
          role='slider'
          aria-orientation='vertical'
          tabIndex={0}
          aria-valuemin={minValue}
          aria-valuemax={maxValue}
          aria-valuenow={currentStep.value}
          aria-valuetext={`CHF ${currentStep.value}`}
          style={{
            y,
            scale: 1,
            // transformOrigin: "50% 50%",
          }}
          whileHover={{ scale: 1.1 }}
          whileFocus={{ scale: 1.5 }}
          whileTap={{ scale: 1.5 }}
          whileDrag={{ scale: 1.5 }}
          onKeyDown={onKeyDown}
          animate={animationControls}
          transition={SLIDER_TRANSITION}
          drag
          dragConstraints={{ top: 0, bottom: height, left: 0, right: 0 }}
          dragElastic={false}
          dragMomentum={false}
          onDrag={(e, info) => {
            if (trackRef.current) {
              const y =
                info.point.y -
                trackRef.current.getBoundingClientRect().y -
                window.scrollY

              const step = getStepAtY(y)
              if (step.position !== currentStep.position) {
                // console.log(step);
                // setCurrentStep(step)
                onChange(step)
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
              // setCurrentStep(step)
              onChange(step)

              animationControls.start({
                y: sliderScale(step.position),
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
