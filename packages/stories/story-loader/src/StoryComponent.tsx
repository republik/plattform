import React, { Suspense } from 'react'

const STORY_COMPONENTS = {
  'Example Pink': React.lazy(() => import('@republik/stories-example-pink')),
  'Example Blue': React.lazy(() => import('@republik/stories-example-blue')),
}

export const STORY_NAMES = Object.keys(STORY_COMPONENTS)

const StoryComponent: React.FC<{
  name?: string
  [x: string]: unknown
}> = ({ name, ...props }) => {
  if (!name) return <p>Undefined story component name</p>

  const LoadedComponent = STORY_COMPONENTS[name]

  if (!LoadedComponent) return <p>{name} story component does not exist</p>

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadedComponent {...props} />
    </Suspense>
  )
}

export default StoryComponent
