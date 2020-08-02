import React, { useContext, Children } from 'react'

export const VariableContext = React.createContext({})

export const Variable = ({ variable }) => {
  const vars = useContext(VariableContext)
  return vars[variable]
}

export const If = ({ present, children }) => {
  const vars = useContext(VariableContext)
  const childs = Children.toArray(children)

  if (vars[present]) {
    return <>{childs.filter(child => child.type !== Else)}</>
  }
  return <>{childs.filter(child => child.type === Else)}</>
}

export const Else = ({ children }) => {
  return <>{children}</>
}
