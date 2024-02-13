import { assign, createMachine } from 'xstate'
import { IAudioPlayer, IAudioTrack } from './audio-player.interface'

type AudioPlayerContext<T extends IAudioTrack = IAudioTrack> = {
  audioController: IAudioPlayer<T> | null
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
              initalPosition?: number
              autoPlay?: boolean
              playbackRate?: number
            } & Pick<AudioPlayerContext<T>, 'queue' | 'audioController'>)
          | { type: 'UPDATE_POSITION'; position: number }
          | { type: 'TOGGLE_AUTOPLAY'; autoPlay?: boolean }
          | { type: 'SET_PLAYBACKRATE'; playbackRate: number },
        context: {} as AudioPlayerContext<T>,
      },
      context: {
        audioController: null,
        queue: [],
        currentTrack: null,
        previousTrack: null,
        currentPosition: 0,
        playbackRate: 1,
        autoPlay: false,
      },
      initial: 'Idle',
      on: {
        TOGGLE_AUTOPLAY: {
          actions: assign({
            autoPlay: ({ event }) => Boolean(event?.autoPlay),
          }),
        },
        SET_PLAYBACKRATE: {
          actions: assign({
            playbackRate: ({ event, context }) => {
              const playbackRate =
                Number(event.playbackRate) > 0 ? Number(event.playbackRate) : 1
              context.audioController?.setPlaybackRate(playbackRate)
              return playbackRate
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
              target: 'Stopped',
              actions: assign(({ event }) => {
                const [firstTrack, ...queue] = event.queue
                return {
                  audioController: event.audioController,
                  currentTrack: firstTrack,
                  queue,
                  currentPosition: event?.initalPosition || 0,
                  autoPlay: Boolean(event.autoPlay),
                }
              }),
            },
          },
        },
        Stopped: {
          description:
            "The audio player is not playing any track. It's ready to start playing when the user hits play.",
          entry: {
            type: 'stopPlayback',
          },
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
              target: 'Stopped',
            },
            SKIP: {
              target: 'Ended',
            },
            END: {
              target: 'Ended',
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
            UPDATE_POSITION: {
              actions: {
                type: 'updateTime',
              },
            },
            SEEK: {
              actions: {
                type: 'seekTo',
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
              target: 'Stopped',
            },
            SKIP: {
              target: 'Ended',
            },
            END: {
              target: 'Ended',
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
          },
        },
        Ended: {
          entry: 'endTrack',
          on: {
            '*': [
              {
                guard: 'shouldAutoPlay',
                actions: 'setupPlayback',
                target: 'Playing',
              },
              {
                target: 'Stopped',
              },
            ],
          },
        },
      },
    },
    {
      actions: {
        setupPlayback: assign(({ context }) => {
          if (!context.currentTrack) {
            return {}
          }
          context?.audioController?.setupTrack(context.currentTrack)
          return {
            currentPosition: 0,
          }
        }),
        stopPlayback: assign(({ context }) => {
          context.audioController?.pause()
          context.audioController?.seekTo(0)
          return {
            currentPosition: 0,
          }
        }),
        pausePlayback: ({ context }) => {
          context.audioController?.pause()
        },
        resumePlayback: ({ context }) => {
          context.audioController?.play()
        },
        updateTime: assign({
          currentPosition: ({ event, context }) =>
            event.type === 'UPDATE_POSITION'
              ? event.position
              : context.currentPosition,
        }),
        forwardTrack: assign({
          currentPosition: ({ context, event }) => {
            if (event.type !== 'FORWARD') return
            const positon = Math.min(
              (context.currentPosition += event.secs || 0),
              ((context?.currentTrack?.duration || 0) / 1000,
              Number.MAX_SAFE_INTEGER),
            )
            context.audioController?.seekTo(positon)
            return positon
          },
        }),
        backwardTrack: assign({
          currentPosition: ({ context, event }) => {
            if (event.type !== 'BACKWARD') return
            const positon = Math.max(
              (context.currentPosition -= event.secs || 0),
              0,
            )
            if (context.audioController) context.audioController.seekTo(positon)
            return positon
          },
        }),
        endTrack: assign(({ context }) => {
          const [nextUp, ...queue] = context.queue
          console.log('Ended', {
            nextUp,
            queue,
            currentTrack: context.currentTrack,
          })

          context.audioController?.reset()

          return {
            queue: queue,
            currentTrack: nextUp,
            previousTrack: context.currentTrack,
          }
        }),
        seekTo: assign({
          currentPosition: ({ event, context }) => {
            if (event.type !== 'SEEK') {
              return context.currentPosition
            }

            context.audioController?.seekTo(event.currentPosition)
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
