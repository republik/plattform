import { scalePoint } from 'd3-scale'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  SLIDER_TRANSITION,
  SLIDER_VALUE_AVERAGE,
  SLIDER_VALUE_MINIMUM,
  SLIDER_VALUES,
} from './config'
import { css } from '@app/styled-system/css'
import {
  motion,
  MotionValue,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
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
    height: 130,
    width: '100%',
  }),
  track: css({
    position: 'absolute',
    left: 0,
    top: '50%',
    width: '100%',
    height: 28,
    marginTop: '-14px',
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
    marginTop: '-14px',
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
    marginTop: -24,
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
    marginTop: -25,
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
    width: 50,
    marginLeft: -25,
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
            Math.max(0, Math.round(d / sliderScale.step())),
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
  initialStep: SliderValue
  step: SliderValue
  width: number
  onChange: (step: SliderValue) => void
}

const Tick = ({
  sliderCoord,
  sliderValue,
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
  const background = useTransform(sliderCoord, (sliderCoord) => {
    // if (tick.value === SLIDER_VALUE_AVERAGE) {
    //   return '#F0DC28'
    // }

    // if (
    //   sliderValue <= SLIDER_VALUE_AVERAGE &&
    //   tick.value <= SLIDER_VALUE_AVERAGE
    // ) {
    //   return '#F0DC28'
    // }

    return sliderCoord > tickCoord
      ? 'var(--colors-page-background)'
      : 'var(--colors-primary)'
  })

  const color = useTransform(sliderCoord, (sliderCoordValue) => {
    // if (tick.value === SLIDER_VALUE_AVERAGE) {
    //   return 'black'
    // }

    // if (
    //   sliderValue <= SLIDER_VALUE_AVERAGE &&
    //   tick.value <= SLIDER_VALUE_AVERAGE
    // ) {
    //   return 'black'
    // }

    return sliderCoordValue > tickCoord
      ? 'var(--colors-page-background)'
      : 'var(--colors-primary)'
  })

  return (
    <motion.div
      className={
        // tick.value === SLIDER_VALUE_AVERAGE
        //   ? [styles.tick, styles.tickDefault].join(' ')
        //   : styles.tick
        styles.tick
      }
      style={{
        x: tickCoord,
        // background,
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
  initialStep,
  step: currentStep,
  width,
  onChange,
}: PriceSliderProps) => {
  const padding = 24
  const { sliderScale, getStepAtCoord, ticks } = useSliderStuff(width, padding)

  const trackRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimationControls()
  const coord = useMotionValue(sliderScale.range()[0])
  const valueIndicatorCoord = useSpring(coord, {
    stiffness: 5000,
    damping: 100,
  })
  const valueIndicatorText = useTransform(
    coord,
    (yValue) => getStepAtCoord(yValue - padding).value,
  )
  const fillSize = useTransform(coord, (yValue) =>
    Math.min(width, padding + yValue),
  )

  // const sliderColor =
  //   currentStep.value === SLIDER_VALUE_MINIMUM
  //     ? '#D0913C'
  //     : currentStep.value <= SLIDER_VALUE_AVERAGE
  //     ? '#F0DC28'
  //     : 'var(--colors-primary)'

  useEffect(() => {
    animationControls.start({
      x: sliderScale(initialStep.position),
      transition: { ...SLIDER_TRANSITION, duration: 1 },
    })
  }, [initialStep])

  // useEffect(() => {
  //   if (!coord.isAnimating()) {
  //     coord.set(sliderScale(currentStep.position))
  //   }
  // }, [width, currentStep])

  const gotoPos = (pos: number) => {
    if (currentStep !== getSliderStepAtPosition(pos)) {
      animationControls.stop()
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
        <div
          className={styles.track}
          // style={{ background: 'var(--colors-disabled)' }}
        ></div>

        <motion.div
          className={styles.trackFill}
          // {...colorScheme.set('background', 'primary')}
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
          style={{ x: valueIndicatorCoord }}
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
          whileFocus={{ scale: 1.5 }}
          whileTap={{ scale: 1.5 }}
          whileDrag={{ scale: 1.5 }}
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
          onDrag={(e, info) => {
            if (trackRef.current) {
              const x =
                info.point.x -
                trackRef.current.getBoundingClientRect().x -
                window.scrollX -
                padding

              const step = getStepAtCoord(x)
              if (step.position !== currentStep.position) {
                // setCurrentStep(step)
                onChange(step)
              }
            }
          }}
          onDragEnd={(e, info) => {
            if (trackRef.current) {
              const x =
                info.point.x -
                trackRef.current.getBoundingClientRect().x -
                window.scrollX -
                padding
              // console.log(y);

              const step = getStepAtCoord(x)
              // setCurrentStep(step)
              onChange(step)

              animationControls.start({
                x: sliderScale(step.position),
                scale: 1,
                transition: {
                  delay: 0.01, // add slight delay, otherwise it interferes with drag
                },
              })
            }
          }}
        >
          {/* <svg
            width='18'
            height='16'
            viewBox='0 0 18 16'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect y='0.84375' width='18' height='3' rx='1.5' />
            <rect y='6.84375' width='18' height='3' rx='1.5' />
            <rect y='12.8438' width='18' height='3' rx='1.5' />
          </svg> */}

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
