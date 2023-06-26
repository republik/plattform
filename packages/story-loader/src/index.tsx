import React, { Suspense } from 'react'

const StoryComponent: React.FC<{
  name: string
  [x: string]: unknown
}> = ({ name, ...props }) => {
  const LoadedComponent = React.lazy(() => import(name))
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadedComponent {...props} />
    </Suspense>
  )
}

export default StoryComponent
