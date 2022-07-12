import React, { useContext, useState, createContext, useRef } from 'react'

const LinkInfoContext = createContext(null)

export const useLinkInfoContext = () => useContext(LinkInfoContext)

export const LinkInfoContextProvider = ({ children }) => {
  const [expandedLink, setExpandedLink] = useState(undefined)
  const timeOutRef = useRef<NodeJS.Timeout>(null)
  return (
    <LinkInfoContext.Provider
      value={[expandedLink, setExpandedLink, timeOutRef]}
    >
      {children}
    </LinkInfoContext.Provider>
  )
}

export default LinkInfoContext
