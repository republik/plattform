import React from 'react'

type LeadProps = {
  children: React.ReactNode
}

const Lead = ({ children }: LeadProps) => {
  return <span>{children}</span>
}

export default Lead
