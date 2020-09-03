import React from 'react'

import { createFormatter } from '../../../lib/translate'
import { Editorial } from '../../Typography'

import { default as Button } from '../../Button'
import { SecondaryAction } from '../Internal/Composer'
import { CommentComposer } from './CommentComposer'
import { DiscussionContext } from '../DiscussionContext'
import { Markdown, Mood } from '../../Icons'

export { CommentComposerPlaceholder } from './CommentComposerPlaceholder'

const t = createFormatter(require('../../../lib/translations.json').data)
const someText = 'Das Tückische beim Crowdfunding ist, dass der Ansturm'

export const CommentComposerPlayground = () => {
  const [
    { counter, mode, initialText, tagRequired, maxLength },
    dispatch
  ] = React.useReducer(
    (state, action) => {
      if ('start' in action) {
        return {
          ...state,
          counter: state.counter + 1,
          mode: 'composer',
          initialText: action.start.initialText,
          tagRequired: action.start.tagRequired,
          maxLength: action.start.maxLength
        }
      } else if ('cancel' in action) {
        return { ...state, mode: 'initial' }
      } else if ('submit' in action) {
        return { ...state, mode: 'wait', ...action.submit }
      } else if ('reject' in action) {
        state.resolve({ error: action.reject.reason })
        return { ...state, mode: 'composer' }
      } else if ('accept' in action) {
        state.resolve({ ok: true })
        return { ...state, mode: 'initial' }
      }

      return state
    },
    {
      counter: 1,
      mode: 'composer',
      initialText: someText,
      tagValue: undefined,
      tagRequired: true
    }
  )

  const discussionContextValue = {
    discussion: {
      displayAuthor: {
        name: 'Adrienne Fichter',
        profilePicture: '/static/profilePicture1.png',
        credential: { description: 'Redaktorin', verified: false }
      },
      rules: { maxLength },
      tags: ['Lob', 'Kritik', 'Wunsch', 'Keine Angabe'],
      tagRequired
    },
    actions: {
      openDiscussionPreferences: () => Promise.resolve({ ok: true })
    },
    composerSecondaryActions: (
      <>
        <SecondaryAction>
          <Mood height={26} width={26} />
        </SecondaryAction>
        <SecondaryAction>
          <Markdown height={26} width={26} />
        </SecondaryAction>
      </>
    )
  }

  return (
    <div>
      {mode !== 'initial' && (
        <DiscussionContext.Provider value={discussionContextValue}>
          <CommentComposer
            isRoot
            key={counter}
            t={t}
            initialText={initialText}
            onClose={() => {
              dispatch({ cancel: {} })
            }}
            onSubmit={(text, tags) =>
              new Promise(resolve => {
                dispatch({ submit: { resolve } })
              })
            }
          />
        </DiscussionContext.Provider>
      )}

      {mode === 'initial' && (
        <div style={{ margin: 20 }}>
          <div style={{ textAlign: 'center', margin: 20 }}>
            <Editorial.Lead>
              To get started, select in which initial state the composer should
              appear.
            </Editorial.Lead>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ margin: 4 }}>
              <Button
                primary
                onClick={() => {
                  dispatch({
                    start: {
                      initialText: undefined,
                      tagValue: undefined,
                      tagRequired: false,
                      maxLength: undefined
                    }
                  })
                }}
              >
                Blank
              </Button>
            </div>
            <div style={{ margin: 4 }}>
              <Button
                primary
                onClick={() => {
                  dispatch({
                    start: {
                      initialText: someText,
                      tagValue: 'Wunsch',
                      tagRequired: true,
                      maxLength: 60
                    }
                  })
                }}
              >
                Prefilled
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode === 'wait' && (
        <div style={{ marginTop: 40, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', margin: 20 }}>
            <Editorial.Lead>
              Does the backend accept or reject the comment?
            </Editorial.Lead>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ margin: 4 }}>
              <Button
                primary
                onClick={() => {
                  dispatch({
                    reject: {
                      reason:
                        'Sie sind zu früh. Bitte warten Sie, zwei Minuten bevor Sie wieder kommentieren.'
                    }
                  })
                }}
              >
                Reject
              </Button>
            </div>
            <div style={{ margin: 4 }}>
              <Button
                primary
                onClick={() => {
                  dispatch({ accept: {} })
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
