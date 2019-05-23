import React, { Fragment } from 'react'

import { default as MdMarkdown } from 'react-icons/lib/go/markdown'
import { default as MdMood } from 'react-icons/lib/md/mood'

import { createFormatter } from '../../../lib/translate'
import { Editorial } from "../../Typography"

import { default as Button } from '../../Button'
import { SecondaryAction } from '../Internal/Composer'
import { CommentComposer } from './CommentComposer'

export { CommentComposerPlaceholder } from './CommentComposerPlaceholder'

const t = createFormatter(require('../../../lib/translations.json').data)
const someText = "Das Tückische beim Crowdfunding ist, dass der Ansturm"

export const CommentComposerPlayground = () => {
  const [{ counter, mode, initialText, tagRequired }, dispatch] = React.useReducer((state, action) => {
    if ('start' in action) {
      return { ...state, counter: state.counter + 1, mode: 'composer', initialText: action.start.initialText, tagRequired: action.start.tagRequired }
    } else if ('cancel' in action) {
      return { ...state, mode: 'initial' }
    } else if ('submit' in action) {
      return { ...state, mode: 'wait', ...action.submit }
    } else if ('reject' in action) {
      state.reject(action.reject.reason)
      return { ...state, mode: 'composer' }
    } else if ('accept' in action) {
      state.resolve()
      return { ...state, mode: 'initial' }
    }

    return state;
  }, { counter: 1, mode: "composer", initialText: someText, tagValue: undefined, tagRequired: true })

  return (
    <div>
      {mode !== 'initial' && (
        <CommentComposer
          key={counter}
          t={t}
          initialText={initialText}
          tagRequired={tagRequired}
          displayAuthor={{
            name: 'Adrienne Fichter',
            profilePicture: '/static/profilePicture1.png',
            credential: { description: 'Redaktorin', verified: false }
          }}
          onEditPreferences={() => { }}
          onClose={() => { dispatch({ cancel: {} }) }}
          onSubmit={(text, tags) => new Promise((resolve, reject) => {
            dispatch({ submit: { resolve, reject } });
          })}
          maxLength={60}
          tags={['Lob', 'Kritik', 'Wunsch', 'Keine Angabe']}
          secondaryActions={(
            <Fragment>
              <SecondaryAction><MdMood height={26} width={26} /></SecondaryAction>
              <SecondaryAction><MdMarkdown height={26} width={26} /></SecondaryAction>
            </Fragment>
          )}
        />
      )}

      {mode === 'initial' && (
        <div style={{ margin: 20 }}>
          <div style={{ textAlign: 'center', margin: 20 }}>
            <Editorial.Lead>To get started, select in which initial state the composer should appear.</Editorial.Lead>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ margin: 4 }}>
              <Button primary onClick={() => { dispatch({ start: { initialText: undefined, tagValue: undefined, tagRequired: false } }) }}>Blank</Button>
            </div>
            <div style={{ margin: 4 }}>
              <Button primary onClick={() => { dispatch({ start: { initialText: someText, tagValue: 'Wunsch', tagRequired: true } }) }}>Prefilled</Button>
            </div>
          </div>
        </div>
      )}

      {mode === 'wait' && (
        <div style={{ marginTop: 40, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', margin: 20 }}>
            <Editorial.Lead>Does the backend accept or reject the comment?</Editorial.Lead>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ margin: 4 }}>
              <Button primary onClick={() => {
                dispatch({ reject: { reason: "Sie sind zu früh. Bitte warten Sie, zwei Minuten bevor Sie wieder kommentieren." } })
              }}>Reject</Button>
            </div>
            <div style={{ margin: 4 }}>
              <Button primary onClick={() => { dispatch({ accept: {} }) }}>Accept</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}