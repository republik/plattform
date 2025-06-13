import { css } from '@republik/theme/css'
import { scalePoint } from 'd3-scale'
import {
  MotionValue,
  motion,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { SLIDER_TRANSITION, SLIDER_VALUES } from './config'
import {
  SliderValue,
  getFirstSliderStep,
  getLastSliderStep,
  getNextSliderStep,
  getPreviousSliderStep,
  getSliderStep,
  getSliderStepAtPosition,
} from './helpers'

const styles = {
  container: css({
    position: 'relative',
    height: 100,
    width: '100%',
  }),
  track: css({
    position: 'absolute',
    left: 0,
    top: '50%',
    width: '100%',
    height: 28,
    // marginTop: '-14px',
    background: 'pageBackground',
    borderWidth: 2,
    borderColor: 'primary',
    borderRadius: 'full',
  }),
  trackFill: css({
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 28,
    width: 0,
    // marginTop: '-14px',
    background: 'primary',
    borderRadius: 'full',
  }),
  tick: css({
    fontWeight: 'medium',
    cursor: 'pointer',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    marginTop: '-10px',
    top: '50%',
    marginLeft: -24,
    color: 'pageBackground',
    fontSize: 14,
    userSelect: 'none',
    // borderColor: 'primary',
    // borderWidth: 3,
    '&:first-of-type': {
      marginLeft: -7,
      justifyContent: 'flex-start',
    },
    '&:last-of-type': {
      marginLeft: -41,
      justifyContent: 'flex-end',
    },
  }),

  thumb: css({
    cursor: 'pointer',
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 50,
    height: 50,
    background: 'primary',
    color: 'pageBackground',
    // borderWidth: 4,
    // borderStyle: 'solid',
    borderRadius: 'full',
    // transform: `translate(0, -1.5rem)`,
    // marginLeft: "-1.5rem",
    marginTop: '-11px',
    marginLeft: -25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'sm',
  }),
  valueIndicator: css({
    position: 'absolute',
    left: 0,
    top: 0,
    width: 100,
    marginLeft: -50,
    textAlign: 'center',
    fontWeight: 'bold',
  }),
}

const minValue = getFirstSliderStep().value
const maxValue = getLastSliderStep().value

const useSliderStuff = (sliderWidth = 400, padding = 14) => {
  return useMemo(() => {
    // Scales
    const sliderScale = scalePoint(
      SLIDER_VALUES.map((v) => v.position),
      [padding, sliderWidth - padding],
    )

    const getStepAtCoord = (d: number) => {
      const i = isNaN(d)
        ? 0
        : Math.min(
            SLIDER_VALUES.length - 1,
            Math.max(0, Math.round((d - padding) / sliderScale.step())),
          )
      return getSliderStepAtPosition(i)
    }

    const ticks = SLIDER_VALUES.filter((d) => {
      return d.tick
    })

    return { sliderScale, getStepAtCoord, ticks }
  }, [sliderWidth])
}

type PriceSliderProps = {
  step: SliderValue
  width: number
  onChange: (step: SliderValue) => void
}

const Tick = ({
  sliderCoord,
  tickCoord,
  tick,
  onClick,
}: {
  sliderCoord: MotionValue
  sliderValue: number
  tickCoord: number
  tick: SliderValue
  onClick: MouseEventHandler<HTMLDivElement>
}) => {
  const color = useTransform(sliderCoord, (sliderCoordValue) => {
    return sliderCoordValue > tickCoord
      ? 'var(--colors-page-background)'
      : 'var(--colors-primary)'
  })

  return (
    <motion.div
      className={styles.tick}
      style={{
        x: tickCoord,
        color,
      }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      <div>{tick.value}</div>
    </motion.div>
  )
}

export const PriceSlider = ({
  // initialStep,
  step: currentStep,
  width,
  onChange,
}: PriceSliderProps) => {
  const padding = 24
  const { sliderScale, getStepAtCoord, ticks } = useSliderStuff(width, padding)
  const [initialized, setInitialized] = useState(false)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimationControls()
  const coord = useMotionValue(sliderScale.range()[0])
  const valueIndicatorCoord = useSpring(coord, {
    stiffness: 5000,
    damping: 200,
  })
  const valueIndicatorText = useTransform(
    coord,
    (v) => `CHF ${getStepAtCoord(v).value}`,
  )
  const valueIndicatorVelocity = useVelocity(valueIndicatorCoord)
  const valueIndicatorTilt = useTransform(
    valueIndicatorVelocity,
    [-3000, 0, 3000],
    [10, 0, -10],
  )
  const fillSize = useTransform(coord, (v) => Math.min(width, padding + v))

  // Update step based on the main motion value
  useMotionValueEvent(coord, 'change', (v) => {
    if (dragging) {
      const step = getStepAtCoord(v)
      if (step !== currentStep) {
        onChange(step)
      }
    }
  })

  useEffect(() => {
    if (!initialized) {
      animationControls.start({
        x: sliderScale(currentStep.position),
        transition: { ...SLIDER_TRANSITION, duration: 1 },
      })
      setInitialized(true)
    }
  }, [initialized, currentStep])

  useEffect(() => {
    if (!coord.isAnimating() && !dragging) {
      coord.set(sliderScale(currentStep.position))
    }
  }, [width, currentStep, coord, dragging])

  const gotoPos = (pos: number) => {
    if (currentStep !== getSliderStepAtPosition(pos)) {
      animationControls.start({
        x: sliderScale(pos),
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
        className={styles.container}
        ref={trackRef}
        data-id='price-slider'
        key={`h-${width}`} // rerender content when slider resizes to re-initialize drag behavior
      >
        <div className={styles.track}></div>

        <motion.div
          className={styles.trackFill}
          style={{ width: fillSize }}
        ></motion.div>

        <div>
          {ticks.map((tick) => {
            return (
              <Tick
                key={tick.position}
                tick={tick}
                tickCoord={sliderScale(tick.position)}
                sliderCoord={coord}
                sliderValue={currentStep.value}
                onClick={() => {
                  gotoPos(tick.position)
                }}
              />
            )
          })}
        </div>

        <motion.div
          className={styles.valueIndicator}
          style={{
            x: valueIndicatorCoord,
            rotate: valueIndicatorTilt,
          }}
        >
          {valueIndicatorText}
        </motion.div>

        <motion.div
          className={styles.thumb}
          role='slider'
          aria-orientation='horizontal'
          tabIndex={0}
          aria-valuemin={minValue}
          aria-valuemax={maxValue}
          aria-valuenow={currentStep.value}
          aria-valuetext={`CHF ${currentStep.value}`}
          style={{
            x: coord,
            scale: 1,
          }}
          whileHover={{ scale: 1.2 }}
          whileFocus={{ scale: 1.2 }}
          whileTap={{ scale: 1.4 }}
          whileDrag={{ scale: 1.3 }}
          onKeyDown={onKeyDown}
          animate={animationControls}
          transition={SLIDER_TRANSITION}
          drag
          dragConstraints={{
            top: 0,
            left: sliderScale.range()[0],
            right: sliderScale.range()[1],
            bottom: 0,
          }}
          dragElastic={false}
          dragMomentum={false}
          onDragStart={() => {
            setDragging(true)
          }}
          onDragEnd={() => {
            setDragging(false)
          }}
        >
          <svg
            width='26'
            height='16'
            viewBox='0 0 26 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M18 2L24 8L18 14'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M8 2L2 8L8 14'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </motion.div>
      </div>
    </>
  )
}
