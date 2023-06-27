import React, { Suspense } from 'react'

const LoadedComponent = React.lazy(() => import('@republik/stories-example'))

const StoryComponent: React.FC<{
  name: string
  [x: string]: unknown
}> = ({ name, ...props }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadedComponent {...props} />
    </Suspense>
  )
}

export default StoryComponent
