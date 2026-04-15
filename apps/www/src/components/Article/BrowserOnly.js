import { useState, useEffect } from 'react'
import ActionBar from '../ActionBar'

let defaultIstMounted = undefined
const BrowserOnly = ({ Component, height, componentProps }) => {
  const [isMounted, setIsMounted] = useState(defaultIstMounted)
  useEffect(() => {
    if (!isMounted) {
      defaultIstMounted = true
      setIsMounted(true)
    }
  }, [isMounted])

  if (!isMounted) {
    return <div style={{ height }} />
  }
  return <Component {...componentProps} />
}

export default BrowserOnly

export const BrowserOnlyActionBar = (props) => {
  return (
    <BrowserOnly Component={ActionBar} componentProps={props} height={24} />
  )
}
