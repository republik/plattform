import React, { startTransition, Suspense, useEffect, useState } from 'react'

const STORY_COMPONENTS = {
  'Example Pink': React.lazy(() => import('@republik/stories-example-pink')),
  'Example Blue': React.lazy(() => import('@republik/stories-example-blue')),
  'Auf den Punkt: Banken': React.lazy(
    () => import('@republik/stories-the-dot-banks'),
  ),
  'Auf den Punkt: IVF': React.lazy(
    () => import('@republik/stories-the-dot-ivf'),
  ),
}

export const STORY_NAMES = Object.keys(STORY_COMPONENTS)

const StoryComponent: React.FC<{
  name?: string
  [x: string]: unknown
}> = ({ name, ...props }) => {
  const [LoadedComponent, setLoadedComponent] = useState(STORY_COMPONENTS[name])

  useEffect(() => {
    // Without startTransition, the following error pops up:
    //  "Uncaught Error: This Suspense boundary received an update before it
    //  finished hydrating. This caused the boundary to switch to client rendering.
    //  The usual way to fix this is to wrap the original update in startTransition."
    // Root cause seems to be that "name" prop is defined, then undefined for a short while, then defined again…
    // TODO: we need to check that this is ok so...
    startTransition(() => {
      if (name) {
        setLoadedComponent(STORY_COMPONENTS[name])
      }
    })
  }, [name])

  if (!LoadedComponent) return <p>{name} story component does not exist</p>

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadedComponent {...props} />
    </Suspense>
  )
}

export default StoryComponent
