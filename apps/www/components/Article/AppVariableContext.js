import { useState, useEffect } from 'react'
import { VariableContext, withMe } from '@project-r/styleguide'

const AppVariableContext = withMe(({ me, hasAccess, children }) => {
  // we don't set variables during SSR because we want to cache user natural versions
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  return (
    <VariableContext.Provider
      value={
        me && isMounted
          ? {
              firstName: me.firstName,
              lastName: me.lastName,
              hasAccess,
            }
          : {}
      }
    >
      {children}
    </VariableContext.Provider>
  )
})

export default AppVariableContext
