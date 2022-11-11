import React from 'react'
import { PauseCircleIcon, PlayCircleIcon } from '../Icons'
import { plainButtonRule } from '../Button'

const PlayButton = ({ onPlay, isActivePlayingItem, style }) =>
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
      {!isActivePlayingItem ? (
        <PlayCircleIcon size={36} />
      ) : (
        <PauseCircleIcon size={36} />
      )}
    </button>
  ) : null

export default PlayButton
