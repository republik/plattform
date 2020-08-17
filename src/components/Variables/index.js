import React, { useContext, Children } from 'react'

export const VariableContext = React.createContext({})

export const Variable = ({ variable, fallback }) => {
  const vars = useContext(VariableContext)
  if (vars._mergeTags) {
    return fallback
      ? `*|IF:${vars[variable]}|* *|${vars[variable]}|* *|ELSE:|* ${fallback} *|END:IF|*`
      : `*|${vars[variable]}|*`
  }
  return vars[variable] || fallback || null
}

export const If = ({ present, children }) => {
  const vars = useContext(VariableContext)
  if (vars._mergeTags) {
    return (
      <>
        {`*|IF:${vars[present] || present}|*`}
        {children}
        {'*|END:IF|*'}
      </>
    )
  }

  const childs = Children.toArray(children)
  if (vars[present]) {
    return <>{childs.filter(child => child.type !== Else)}</>
  }
  return <>{childs.filter(child => child.type === Else)}</>
}

export const Else = ({ children }) => {
  const vars = useContext(VariableContext)
  return (
    <>
      {vars._mergeTags && '*|ELSE:|*'}
      {children}
    </>
  )
}
