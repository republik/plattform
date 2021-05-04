import React, { useEffect, useState } from 'react'
import CustomIconBase from './CustomIconBase'
import { MdShare } from '@react-icons/all-files/md/MdShare'

export const ShareIcon = ({ fill, ...props }) => {
  const [useAndroidIcon, setUseAndroidIcon] = useState(false)
  useEffect(() => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : window.navigator.userAgent
    setUseAndroidIcon(Boolean(userAgent.match(/Android|CrOS/)))
  }, [])
  if (useAndroidIcon) {
    return <MdShare {...props} />
  } else {
    return (
      <CustomIconBase {...props}>
        <path
          d='M8.41 9.41L7 8L12 3L17 8L15.59 9.41L13 6.83V16.5H11V6.83L8.41 9.41ZM21 20V11H19V20H5V11H3L3 20C3 21.1 3.9 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20Z'
          fill={fill}
        />
      </CustomIconBase>
    )
  }
}
