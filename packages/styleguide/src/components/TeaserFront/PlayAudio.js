import React from 'react'
import { PlayCircleIcon } from '../Icons'
import { plainButtonRule } from '../Button'

const PlayButton = ({ onPlay, style }) =>
  onPlay ? (
    <button
      {...plainButtonRule}
      title='Beitrag hören'
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onPlay()
      }}
    >
      <PlayCircleIcon size={36} />
    </button>
  ) : null

export default PlayButton
