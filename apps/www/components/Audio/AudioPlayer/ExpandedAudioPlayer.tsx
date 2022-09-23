import React from 'react'
import { css } from 'glamor'
import {
  IconButton,
  ExpandMoreIcon,
  mediaQueries,
  Scroller,
  TabButton,
  useColorContext,
} from '@project-r/styleguide'
import { AudioPlayerProps } from './shared'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import Queue from './ui/Queue'
import AudioControl, { AudioControlProps } from './ui/AudioControl'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    height: 'calc(100vh - 48px)',
    marginTop: 24,
    '& > *': {
      userSelect: 'none',
    },
    [mediaQueries.mUp]: {
      marginTop: 0,
      padding: 24,
      maxHeight: '100%',
      height: 'calc(80vh - 48px)',
    },
  }),
  currentPlaying: css({
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),
  controls: css({
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  queueWrapper: css({
    flex: '1 1 0',
    minHeight: 0,
    display: 'inline-flex',
    flexDirection: 'column',
  }),
  bottomActions: css({
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleClose: () => void
} & AudioControlProps &
  Omit<AudioPlayerProps, 'actions'>

const ExpandedAudioPlayer = ({
  t,
  activeItem,
  queuedItems,
  currentTime = 0,
  duration = 0,
  playbackRate,
  isPlaying,
  isLoading,
  buffered,
  handleMinimize,
  handleToggle,
  handleSeek,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
}: ExpandedAudioPlayerProps) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.root}>
      <CurrentlyPlaying t={t} item={activeItem} />
      <AudioControl
        handleToggle={handleToggle}
        handleSeek={handleSeek}
        handleForward={handleForward}
        handleBackward={handleBackward}
        handlePlaybackRateChange={handlePlaybackRateChange}
        isPlaying={isPlaying}
        isLoading={isLoading}
        playbackRate={playbackRate}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
      />
      <div {...styles.queueWrapper}>
        <Scroller>
          <TabButton
            text={t('AudioPlayer/Queue', {
              count: queuedItems.length ? `(${queuedItems.length})` : null,
            })}
            isActive
          />
          <TabButton text='Alle' />
          <span
            style={{
              flexGrow: 1,
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }}
            {...colorScheme.set('borderColor', 'divider')}
          />
        </Scroller>
        <div
          style={{
            flex: '1 1 0',
            minHeight: 0,
            overflowY: 'scroll',
          }}
        >
          {true && <Queue t={t} activeItem={activeItem} items={queuedItems} />}
        </div>
      </div>
      <div {...styles.bottomActions}>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-start',
          }}
        >
          <span>Share</span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            Icon={ExpandMoreIcon}
            size={32}
            style={{ marginRight: 0 }}
            onClick={handleMinimize}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div {...styles.root}>
      <div {...styles.currentPlaying}>
        <CurrentlyPlaying t={t} item={activeItem} />
        <div {...styles.controls}>
          <AudioControl
            handleToggle={handleToggle}
            handleSeek={handleSeek}
            handleForward={handleForward}
            handleBackward={handleBackward}
            handlePlaybackRateChange={handlePlaybackRateChange}
            isPlaying={isPlaying}
            isLoading={isLoading}
            playbackRate={playbackRate}
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
          />
        </div>
      </div>
      {queuedItems && queuedItems.length > 0 && (
        <Queue t={t} activeItem={activeItem} items={queuedItems} />
      )}
      <div {...styles.bottomActions}>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-start',
          }}
        >
          <span>Share</span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'inline-flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            Icon={ExpandMoreIcon}
            size={32}
            style={{ marginRight: 0 }}
            onClick={handleMinimize}
          />
        </div>
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer
