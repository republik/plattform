import { useState, useEffect, useRef, ReactNode, useMemo } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

import { css } from 'glamor'

import dynamic from 'next/dynamic'
import submarineGeoJson from '../components/CableGlobe/cable-geo.json'

import type { GlobeMethods } from 'react-globe.gl'

const cablePaths = []
submarineGeoJson.features.forEach(({ geometry, properties }) => {
  geometry.coordinates.forEach((coords) =>
    cablePaths.push({ coords, properties }),
  )
})

const Globe = dynamic(() => import('../components/CableGlobe/CableGlobe'), {
  ssr: false,
  loading: () => <>Loading</>,
})

const CustomGlobe = () => {
  const globeEl = useRef<GlobeMethods>(null)

  const [inViewList, setInViewList] = useState([
    false,
    false,
    false,
    false,
    false,
  ])

  const handleInView = (idx: number) => (inView: boolean) => {
    setInViewList((v1) => {
      // Check for different value, only return new array if it has changed -> fewer state updates
      if (v1[idx] !== inView) {
        const v2 = [...v1]
        v2[idx] = inView
        return v2
      }
      return v1
    })
  }

  const lastInView = inViewList.lastIndexOf(true) || -1

  return (
    <div className='Scrolly' {...styles.scrolly}>
      <div {...styles.scrollyGraphicsContainer}>
        <Globe
          globeRef={globeEl}
          globeImageUrl='/static/cable-globe/mopo-world.jpg'
          // bumpImageUrl='//unpkg.com/three-globe/example/img/earth-topology.png'
          // backgroundImageUrl='//unpkg.com/three-globe/example/img/night-sky.png'
          backgroundColor='#fff'
          pathsData={cablePaths}
          pathPoints='coords'
          pathPointLat={(p) => p[1]}
          pathPointLng={(p) => p[0]}
          pathColor={(path) => path.properties.color}
          pathTransitionDuration={0}
          pathStroke={2}
          animateIn={false}
          showAtmosphere={false}
          // pathDashLength={0.1}
          // pathDashGap={0.008}
          // pathDashAnimateTime={12000}
          onGlobeReady={() => {
            const MAP_CENTER = { lat: 32, lng: 30, altitude: 0.3 }
            if (globeEl.current) {
              globeEl.current.controls().enableZoom = false
              globeEl.current.pointOfView(MAP_CENTER, 0)
            }
          }}
        />
      </div>
      <ScrollySlide
        highlighted={lastInView === 0}
        onChangeInView={handleInView(0)}
      >
        Step 1
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        Step 2
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        Step 3
      </ScrollySlide>
    </div>
  )
}

const ScrollySlide = ({
  children,
  highlighted,
  onChangeInView,
}: {
  children: ReactNode
  highlighted?: boolean
  onChangeInView: (inView: boolean) => void
}) => {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 60vh'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    console.log({ value })
    if (value >= 1) {
      onChangeInView(true)
    } else {
      onChangeInView(false)
    }
  })

  return (
    <section
      {...styles.scrollySlide}
      ref={ref}
      className='ScrollySlide'
      // style={{ opacity: highlighted ? 1 : 0.5 }}
    >
      {children}
    </section>
  )
}

const styles = {
  scrolly: css({
    position: 'relative',
  }),
  scrollySlide: css({
    position: 'relative',
    maxWidth: '43rem',
    margin: '0 auto',
    marginTop: '10vh',
    height: '50vh',
    zIndex: 1,
    backgroundColor: 'white',
    '&:first-of-type': { paddingTop: '15vh' },
  }),
  scrollyGraphicsContainer: css({
    position: 'sticky',
    top: 0,
    zIndex: 1,
    pointerEvents: 'none',
  }),
}

export default CustomGlobe
