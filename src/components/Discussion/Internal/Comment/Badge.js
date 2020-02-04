import React from 'react'

const Badge = ({ url, badgeUrl }) => {
  return (
    <div>
      <a href={url}>
        <img src={badgeUrl} width={120} height={130} />
      </a>
    </div>
  )
}

export default Badge
