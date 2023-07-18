import React, { startTransition, Suspense, useEffect, useState } from 'react'

const STORY_COMPONENTS = {
  'Example Pink': React.lazy(() => import('@republik/stories-example-pink')),
  'Example Blue': React.lazy(() => import('@republik/stories-example-blue')),
  'Auf den Punkt: Banken': React.lazy(
    () => import('@republik/stories-the-dot-banks'),
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
    //  "This Suspense boundary received an update before it finished hydrating."
    startTransition(() => {
      setLoadedComponent(STORY_COMPONENTS[name])
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
