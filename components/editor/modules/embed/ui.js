import React, { Fragment } from 'react'
import { Checkbox, Radio, Label, Field } from '@project-r/styleguide'
import { createPropertyForm } from '../../utils'
import AutosizeInput from 'react-textarea-autosize'

const isBlockType = blockType => block => block.type === blockType

const isVideoBlock = isBlockType('EMBEDVIDEO')
const isCommentBlock = isBlockType('EMBEDCOMMENT')

export default ({ TYPE, editorOptions = {} }) => {
  const VideoForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(isVideoBlock)
    }
  })(({ disabled, value, onChange }) => {
    const { sizes = [] } = editorOptions
    if (disabled) {
      return null
    }
    return (
      <div>
        {value.blocks.filter(isVideoBlock).map((block, i) => {
          const src = block.data.get('src')
          return (
            <div key={`video-${i}`}>
              {!!editorOptions?.sizes?.length && (
                <p style={{ margin: '10px 0' }}>
                  <Label
                    style={{ display: 'inline-block', marginBottom: '5px' }}
                  >
                    Grösse
                  </Label>
                  <br />
                  {sizes.map((size, i) => {
                    let checked = Object.keys(size.props).every(
                      key => block.data.get(key) === size.props[key]
                    )
                    return [
                      <Radio
                        key={`radio${i}`}
                        checked={checked}
                        onChange={event => {
                          event.preventDefault()
                          if (checked) return

                          let change = value.change().setNodeByKey(block.key, {
                            data: block.data.merge(size.props)
                          })

                          onChange(change)
                        }}
                      >
                        {size.label}
                      </Radio>,
                      <br key={`br${i}`} />
                    ]
                  })}
                  <br />
                  {!!src && src.hls && (
                    <Fragment>
                      <div style={{ margin: '10px 0' }}>
                        <Checkbox
                          checked={block.data.get('forceAudio')}
                          onChange={event => {
                            const checked = block.data.get('forceAudio')
                            let change = value
                              .change()
                              .setNodeByKey(block.key, {
                                data: block.data.merge({ forceAudio: !checked })
                              })
                            onChange(change)
                          }}
                        >
                          nur Audio
                        </Checkbox>
                      </div>
                      <div style={{ margin: '10px 0' }}>
                        <Checkbox
                          checked={block.data.get('cinemagraph')}
                          onChange={event => {
                            const checked = block.data.get('cinemagraph')
                            let change = value
                              .change()
                              .setNodeByKey(block.key, {
                                data: block.data.merge({
                                  cinemagraph: !checked
                                })
                              })
                            onChange(change)
                          }}
                        >
                          Cinemagraph
                        </Checkbox>
                      </div>
                      <div style={{ margin: '10px 0' }}>
                        <Checkbox
                          checked={block.data.get('primary')}
                          onChange={event => {
                            const checked = block.data.get('primary')
                            let change = value
                              .change()
                              .setNodeByKey(block.key, {
                                data: block.data.merge({
                                  primary: !checked
                                })
                              })
                            onChange(change)
                          }}
                        >
                          Primäres Video
                        </Checkbox>
                      </div>
                    </Fragment>
                  )}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  })

  const CommentForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(isCommentBlock)
    }
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    console.log('comment form')
    return (
      <div>
        {value.blocks.filter(isCommentBlock).map((block, i) => {
          const text = block.data.get('text')
          console.log(text, i)
          return (
            <div key={`comment-${i}`}>
              <p style={{ margin: '10px 0' }}>
                <Label style={{ display: 'inline-block', marginBottom: '5px' }}>
                  Comment #{i + 1}
                </Label>
                <br />
                <Field
                  label='text'
                  name='text'
                  value={text}
                  renderInput={({ ref, ...inputProps }) => (
                    <AutosizeInput {...inputProps} inputRef={ref} />
                  )}
                  onChange={event => {
                    let change = value.change().setNodeByKey(block.key, {
                      data: block.data.merge({
                        text: event.target.value
                      })
                    })
                    onChange(change)
                  }}
                />
              </p>
            </div>
          )
        })}
      </div>
    )
  })

  return {
    forms: [VideoForm, CommentForm]
  }
}
