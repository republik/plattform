import { IconContext } from '@react-icons/all-files'
import React, { useContext } from 'react'

export const IconContextProvider = ({ children, value }) => {
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

export const useIconContext = () => {
  return useContext(IconContext)
}
