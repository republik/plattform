import { assign, createMachine } from 'xstate'
import { IAudioPlayer, IAudioTrack } from './audio-player.interface'

type AudioPlayerContext<T extends IAudioTrack = IAudioTrack> = {
  player: IAudioPlayer<T> | null
  queue: T[]
  currentTrack: T | null
  previousTrack: T | null
  currentPosition: number
  playbackRate: number
  autoPlay: boolean
}

export function getAudioPlayerStateMachine<
  T extends IAudioTrack = IAudioTrack,
>() {
  return createMachine(
    {
      id: 'audioplayer',
      types: {
        events: {} as
          | {
              type: 'SETUP'
              queue?: T[]
              initialPosition?: number
              startPlayback?: boolean
            }
          | { type: 'PLAY'; initialPosition?: number }
          | { type: 'PAUSE' }
          | { type: 'STOP' }
          | { type: 'END' }
          | { type: 'SKIP' }
          | { type: 'FORWARD'; secs: number }
          | { type: 'BACKWARD'; secs: number }
          | ({ type: 'SEEK' } & Pick<AudioPlayerContext<T>, 'currentPosition'>)
          | ({
              type: 'PREPARE'
              autoPlay?: boolean
              playbackRate?: number
            } & Pick<AudioPlayerContext<T>, 'queue' | 'player'>)
          | { type: 'UPDATE_POSITION'; position: number }
          | { type: 'SET_AUTOPLAY'; autoPlay?: boolean }
          | { type: 'SET_PLAYBACKRATE'; playbackRate: number }
          | { type: 'SET_DURATION'; duration: number }
          | { type: 'UPDATE_QUEUE'; queue: T[] },
        context: {} as AudioPlayerContext<T>,
      },
      context: {
        player: null,
        queue: [],
        currentTrack: null,
        previousTrack: null,
        currentPosition: 0,
        playbackRate: 1,
        autoPlay: false,
      },
      initial: 'Idle',
      on: {
        SET_AUTOPLAY: {
          actions: assign({
            autoPlay: ({ event, context }) => {
              const value = Boolean(event?.autoPlay)
              context.player?.setAutoPlay(value)
              return value
            },
          }),
        },
        SET_DURATION: {
          actions: assign({
            currentTrack: ({ event, context }) => {
              if (event.type === 'SET_DURATION') {
                return {
                  ...context.currentTrack,
                  duration: event.duration,
                }
              }
              return context.currentTrack
            },
          }),
        },
        SET_PLAYBACKRATE: {
          actions: assign({
            playbackRate: ({ event, context }) => {
              const playbackRate =
                Number(event.playbackRate) > 0 ? Number(event.playbackRate) : 1
              context.player?.setPlaybackRate(playbackRate)
              return playbackRate
            },
          }),
        },
        SEEK: {
          actions: {
            type: 'seekTo',
          },
        },
        FORWARD: {
          actions: {
            type: 'forwardTrack',
          },
        },
        BACKWARD: {
          actions: {
            type: 'backwardTrack',
          },
        },
        UPDATE_QUEUE: {
          actions: assign({
            queue: ({ event }) => {
              console.log('UPDATE_QUEUE', event.queue)
              return event.queue
            },
          }),
        },
      },
      states: {
        Idle: {
          description: 'The audio player is not playing any track.',
          on: {
            PREPARE: {
              description: 'Populate the data in the state-machine',
              target: 'Ready',
              actions: assign(({ event }) => {
                return {
                  player: event.player,
                  currentTrack: null,
                  queue: event.queue || [],
                  autoPlay: Boolean(event.autoPlay),
                }
              }),
            },
          },
        },
        Ready: {
          description:
            "The audio player is not playing any track. It's ready to start playing when the user hits play.",
          // When ever the Ready state is entered and no current track is set
          // we attempt to set the current track to the next track in the queue
          // entry: {
          //   type: 'stopPlayback',
          // },
          on: {
            PLAY: {
              target: 'Playing',
              actions: [
                {
                  type: 'setupPlayback',
                },
              ],
            },
            SKIP: {
              target: 'Ended',
            },
            SETUP: {
              actions: {
                type: 'setupPlayback',
              },
            },
          },
        },
        Playing: {
          description: 'The audio player is currently playing a track.',
          entry: {
            type: 'resumePlayback',
          },
          on: {
            PAUSE: {
              target: 'Paused',
            },
            STOP: {
              target: 'Ready',
              actions: 'stopPlayback',
            },
            SKIP: {
              target: 'Ended',
            },
            END: {
              target: 'Ended',
            },
            UPDATE_POSITION: {
              actions: {
                type: 'updateTime',
              },
            },
            SETUP: {
              actions: {
                type: 'setupPlayback',
                // TODO: MIGHT need to call 'resumePlayback' here
              },
            },
          },
        },
        Paused: {
          description: 'The audio player is currently paused on a track.',
          entry: 'pausePlayback',
          on: {
            PLAY: {
              target: 'Playing',
            },
            STOP: {
              target: 'Ready',
              actions: 'stopPlayback',
            },
            SKIP: {
              target: 'Ended',
            },
            END: {
              target: 'Ended',
            },
            SETUP: {
              target: 'Ready',
              actions: 'setupPlayback',
            },
          },
        },
        /**
         * State that is reached when the current track has ended
         * If 'autoPlay' is enabled, a transition to 'Playing' is triggered
         * Else the state updated to 'Ready'
         */
        Ended: {
          // Cleanup the current track
          entry: 'endTrack',
          on: {
            '*': [
              {
                guard: 'shouldAutoPlay',
                actions: 'setupPlayback',
                target: 'Playing',
              },
              {
                target: 'Ready',
              },
            ],
          },
        },
      },
    },
    {
      actions: {
        /**
         * Setup the current track (or if not available the next track in the queue)
         * on the audio controller
         */
        setupPlayback: assign(({ context, event }) => {
          console.log(
            'setupPlayback',
            event.type,
            context.currentTrack,
            event,
            context,
          )
          const next = context
          const newQueue = event.type === 'SETUP' ? event.queue : context.queue
          const initialPosition =
            event.type === 'SETUP'
              ? event.initialPosition
              : context.currentPosition

          // When playback has ended and auto-play is one
          // a transition from 'Playing' to 'Ended' to 'Playing' is triggered
          // and the current track is null
          const currentQueue = context.queue
          const queueHasChanged =
            currentQueue.map((t) => t.id).join() !==
            newQueue.map((t) => t.id).join()
          const headOfQueueHasChanged =
            queueHasChanged && newQueue[0]?.id !== context.currentTrack?.id

          // In case the head of the queue has changed or the current track is not set
          if (
            // Check if the current track is not set
            !context.currentTrack ||
            // Check if the head of the queue has changed
            headOfQueueHasChanged
          ) {
            const [current, ...queue] = newQueue
            next.currentTrack = current
            next.queue = queue
            next.currentPosition = initialPosition
            console.log('setupPlayback1', next.currentTrack)
            context?.player?.setupTrack(
              next.currentTrack,
              initialPosition,
              event.type === 'SETUP' ? event.startPlayback : false,
            )
            return { ...next }
          }

          if (queueHasChanged) {
            console.log('updaing queue', newQueue)
            next.queue = newQueue.slice(1)
          }

          return {
            ...next,
          }
        }),
        stopPlayback: assign(({ context, event }) => {
          console.log('stopPlayback', event.type, context.currentTrack)
          if (context.player) {
            context.player.pause()
          }
          // In case the previous state was not 'Ended',
          // meaning the user closed the player before the track ended.
          // No state change is needed in this case to allow playing
          // the same track again from the same position
          if (context.currentTrack) {
            return {}
          }

          const [nextUp, ...queue] = context.queue || []
          return {
            queue: queue,
            currentTrack: nextUp,
          }
        }),
        pausePlayback: ({ context }) => {
          context.player?.pause()
        },
        resumePlayback: ({ context }) => {
          context.player?.play()
        },
        /**
         * Set the current track to null
         */
        endTrack: assign(({ context, event }) => {
          console.log('endTrack', event.type, context.currentTrack)
          if (event.type !== 'END') return

          return {
            currentTrack: null,
            currentPosition: 0,
            previousTrack: context.currentTrack,
          }
        }),
        updateTime: assign({
          currentPosition: ({ event, context }) =>
            event.type === 'UPDATE_POSITION'
              ? event.position
              : context.currentPosition,
        }),
        forwardTrack: assign({
          currentPosition: ({ context, event }) => {
            console.log('forwardTrack', event.type, context.currentTrack)
            if (event.type !== 'FORWARD') return
            const positon = Math.min(
              (context.currentPosition += event.secs || 0),
              ((context?.currentTrack?.duration || 0) / 1000,
              Number.MAX_SAFE_INTEGER),
            )
            context.player?.seekTo(positon)
            return positon
          },
        }),
        backwardTrack: assign({
          currentPosition: ({ context, event }) => {
            console.log('backwardTrack', event.type, context.currentTrack)
            if (event.type !== 'BACKWARD') return
            const positon = Math.max(
              (context.currentPosition -= event.secs || 0),
              0,
            )
            context.player?.seekTo(positon)
            return positon
          },
        }),
        seekTo: assign({
          currentPosition: ({ event, context }) => {
            console.log('seekTo', event.type, context.currentTrack)
            if (event.type !== 'SEEK') {
              return context.currentPosition
            }

            context.player?.seekTo(event.currentPosition)
            return event.currentPosition
          },
        }),
        recoverPlayer: assign({}),
      },
      guards: {
        shouldAutoPlay: ({ context }) => context.autoPlay,
      },
    },
  )
}

export const AudioPlayerStateMachine = getAudioPlayerStateMachine()
