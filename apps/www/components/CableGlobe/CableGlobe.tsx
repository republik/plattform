import { MutableRefObject } from 'react'
import Globe, { GlobeMethods, GlobeProps } from 'react-globe.gl'

export default ({
  globeRef,
  ...props
}: {
  globeRef: MutableRefObject<GlobeMethods>
} & GlobeProps) => {
  return <Globe ref={globeRef} {...props} />
}
