import { useState, useEffect, useRef } from 'react'

import dynamic from 'next/dynamic'
import submarineGeoJson from './cable-geo.json'
import type { GlobeMethods } from 'react-globe.gl'

const Globe = dynamic(() => import('../components/CableGlobe/CableGlobe'), {
  ssr: false,
  loading: () => <>Loading</>,
})

const CustomGlobe = () => {
  const [cablePaths, setCablePaths] = useState([])
  const globeEl = useRef<GlobeMethods>(null)

  useEffect(() => {
    // from https://www.submarinecablemap.com
    const cablePaths = []
    submarineGeoJson.features.forEach(({ geometry, properties }) => {
      geometry.coordinates.forEach((coords) =>
        cablePaths.push({ coords, properties }),
      )
    })

    setCablePaths(cablePaths)
  }, [])

  useEffect(() => {
    // globeEl.current.controls().autoRotate = true;
    // globeEl.current.controls().autoRotateSpeed = 0.2;

    const MAP_CENTER = { lat: 0, lng: 0, altitude: 1.5 }
    globeEl.current?.pointOfView(MAP_CENTER, 0)
  }, [globeEl.current])

  return (
    <Globe
      globeRef={globeEl}
      globeImageUrl='//unpkg.com/three-globe/example/img/earth-dark.jpg'
      bumpImageUrl='//unpkg.com/three-globe/example/img/earth-topology.png'
      backgroundImageUrl='//unpkg.com/three-globe/example/img/night-sky.png'
      pathsData={cablePaths}
      pathPoints='coords'
      pathPointLat={(p) => p[1]}
      pathPointLng={(p) => p[0]}
      pathColor={(path) => path.properties.color}
      pathDashLength={0.1}
      pathDashGap={0.008}
      pathDashAnimateTime={12000}
    />
  )
}

export default CustomGlobe
