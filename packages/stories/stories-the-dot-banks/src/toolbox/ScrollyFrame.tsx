// TODO: glamor?
import { css, merge } from 'glamor'
import React, { useEffect, useRef, useState } from 'react'

// TODO: get rid of styleguide dep
import { useColorContext } from '../__styleguide/components/Colors/ColorContext'
import * as mediaQueries from '../__styleguide/theme/mediaQueries'

import { StepsMenu } from './StepsMenu'

export type StoryGraphicProps = {
  step: number
  activeColor?: string
}

export type StoryGraphicType = React.FC<StoryGraphicProps>

/*
  This component provides the frame around the graphical element
  of the scrolly. It also calculates the current step, as well as
  listens to the active color (if applicable) and passes both to
  the graphical element.
 */
export const ScrollyFrame = ({
  stepIds,
  Graphic,
}: {
  stepIds: string[]
  Graphic: StoryGraphicType
}) => {
  // TODO: migrate color ctxt out of styleguide
  const [colorScheme] = useColorContext()

  // TODO: migrate header height ctxt out of styleguide
  // const [headerHeight] = useHeaderHeight()
  const headerHeight = 80

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [activeColor, setActiveColor] = useState<string>(undefined)
  const [isFixed, setFixed] = useState<boolean>(false)
  const [containerHeight, setContainerHeight] = useState<string | number>(
    'auto',
  )

  const containerRef = useRef<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement>()

  // TODO: some error handling would be good
  // TODO: refine the scroll/steps logic
  // TODO: refactor with intersect
  const handleScroll = () => {
    const chartHeight = chartRef.current.getBoundingClientRect().height
    const tops = stepIds.map((id) =>
      Math.abs(
        document.getElementById(id).getBoundingClientRect().top - chartHeight,
      ),
    )

    const i = tops.indexOf(Math.min(...tops))
    // steps are 1-indexed to match story steps
    setCurrentStep(i + 1)

    const stepEvent = new CustomEvent('newStep', {
      bubbles: true,
      detail: { stepId: stepIds[i] },
    })
    document.dispatchEvent(stepEvent)

    if (chartRef.current.getBoundingClientRect().top <= headerHeight) {
      setFixed(true)
      setContainerHeight(chartRef.current.getBoundingClientRect().height)
    }
    if (
      chartRef.current.getBoundingClientRect().bottom <
      containerRef.current.getBoundingClientRect().bottom
    ) {
      setFixed(false)
    }
  }

  const handleEnterColorLabel = (event) => {
    setActiveColor(event.detail.color)
  }

  const handleLeaveColorLabel = () => {
    setActiveColor(undefined)
  }

  // A context to keep track of hover events would also be an option.
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('enterColorLabel', handleEnterColorLabel)
    window.addEventListener('leaveColorLabel', handleLeaveColorLabel)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('enterColorLabel', handleEnterColorLabel)
      window.removeEventListener('leaveColorLabel', handleLeaveColorLabel)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: containerHeight }}>
      <div
        {...merge(styles.container, isFixed && styles.containerScrolled)}
        {...colorScheme.set('backgroundColor', 'default')}
        ref={chartRef}
      >
        <StepsMenu stepIds={stepIds} currentStep={currentStep} />
        <Graphic step={currentStep} activeColor={activeColor} />
      </div>
    </div>
  )
}

const styles = {
  container: css({
    padding: 5,
    /* min-height: 50dvh; */
    width: '100vw',
    left: 0,
    zIndex: 9,
    display: 'flex',
    maxHeight:
      '40vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
    backdropFilter: 'blur(20px)',
    boxShadow: '0px 5px 5px 0px rgba(0,0,0,0.05)',

    [mediaQueries.mUp]: {
      padding: 40,
    },
  }),
  containerScrolled: css({
    position: 'fixed',
    top: 0,
    left: 0,
    marginLeft: 'auto',
    [mediaQueries.mUp]: {
      top: 80,
    },
  }),
}
