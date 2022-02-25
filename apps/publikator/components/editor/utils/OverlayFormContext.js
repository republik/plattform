import React, { useState } from 'react'

export const OverlayFormContext = React.createContext()

export const OverlayFormContextProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <OverlayFormContext.Provider
      value={{
        showModal,
        setShowModal,
      }}
    >
      {children}
    </OverlayFormContext.Provider>
  )
}
