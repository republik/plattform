import React, { useContext, useState, createContext } from 'react'

const LinkInfoContext = createContext()

export const useLinkInfoContext = () => useContext(LinkInfoContext)

export const LinkInfoContextProvider = ({ children }) => {
  const [expandedLinks, setExpandedLinks] = useState([])
  return (
    <LinkInfoContext.Provider value={[expandedLinks, setExpandedLinks]}>
      {children}
    </LinkInfoContext.Provider>
  )
}

export default LinkInfoContext
