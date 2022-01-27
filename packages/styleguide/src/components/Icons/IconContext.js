import { IconContext } from 'react-icons'
import React, { useContext } from 'react'

export const IconContextProvider = ({ children, value }) => {
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

export const useIconContext = () => {
  return useContext(IconContext)
}
