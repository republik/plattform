import React, { useMemo, useRef, useState } from 'react'
import { css, merge } from 'glamor'
import PropTypes from 'prop-types'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { A, colors, fontFamilies, Label } from '@project-r/styleguide'

// CodeMirror can only run in the browser
if (process.browser && window) {
  window.jsonlint = require('jsonlint-mod')
  require('codemirror/mode/javascript/javascript')
  require('codemirror/mode/htmlmixed/htmlmixed')
  require('codemirror/addon/edit/matchbrackets')
  require('codemirror/addon/edit/closebrackets')
  require('codemirror/addon/lint/lint')
  require('codemirror/addon/lint/json-lint')
}

const styles = {
  codemirror: css({
    padding: '30px 0 0',
    '& .CodeMirror': {
      height: 'auto',
      margin: '10px 0 20px',
      fontFamily: fontFamilies.monospaceRegular,
      fontSize: 14,
      color: colors.text
    },
    '& .CodeMirror-lines': {
      backgroundColor: colors.light.hover,
      minHeight: 40
    },
    '& .CodeMirror-cursor': {
      width: 1,
      background: colors.light.text
    }
  })
}

const CodeMirrorField = ({
  label,
  value,
  onChange,
  onPaste,
  options,
  onFocus,
  onBlur,
  linesShown
}) => {
  const [scroll, setScroll] = useState(!!linesShown)
  const style = useMemo(
    () =>
      css({
        '& .CodeMirror': {
          height: scroll ? Math.round(LINE_HEIGHT * linesShown) : 'auto'
        }
      }),
    [scroll]
  )
  return (
    <div {...merge(styles.codemirror, style)}>
      <Label>
        <span>{label}</span>
        {linesShown && (
          <A
            style={{ float: 'right' }}
            href='#toggle-lines'
            onClick={() => setScroll(!scroll)}
          >
            {scroll ? 'More stuff' : 'Less fluff'}
          </A>
        )}
      </Label>
      <CodeMirror
        value={value}
        options={{
          theme: 'neo',
          gutters: ['CodeMirror-linenumbers'],
          lineNumbers: true,
          line: true,
          lineWrapping: true,
          ...options
        }}
        onBeforeChange={(editor, data, value) => {
          onChange(value)
        }}
        onPaste={(editor, event) => {
          onPaste && onPaste(event)
        }}
        onBlur={(editor, event) => {
          onBlur && onBlur(event)
        }}
        onFocus={(editor, event) => {
          onFocus && onFocus(event)
        }}
      />
    </div>
  )
}

const LINE_HEIGHT = 20.133

export const PlainEditor = ({
  label,
  value,
  onChange,
  onPaste,
  mode,
  linesShown,
  readOnly
}) => (
  <CodeMirrorField
    label={label}
    value={value}
    linesShown={linesShown}
    options={{
      mode: mode || 'text',
      readOnly
    }}
    onChange={value => {
      onChange(value)
    }}
    onPaste={event => {
      onPaste(event)
    }}
  />
)

const stringify = json => (json ? JSON.stringify(json, null, 2) : '')

export const JSONEditor = ({
  label,
  config,
  onChange,
  linesShown,
  readOnly
}) => {
  const [stateValue, setStateValue] = useState('')
  const configRef = useRef()
  configRef.current = config
  const valueRef = useRef()
  valueRef.current = stateValue

  return (
    <CodeMirrorField
      onFocus={() => setStateValue(stringify(configRef.current))}
      onBlur={() => {
        setStateValue(stringify(JSON.parse(valueRef.current)))
      }}
      label={label}
      value={stateValue}
      linesShown={linesShown}
      options={{
        mode: 'application/json',
        lint: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        autofocus: true,
        readOnly
      }}
      onChange={newValue => {
        let json
        try {
          json = JSON.parse(newValue)
        } catch (e) {}
        if (json) {
          onChange(json)
        }
        setStateValue(newValue)
      }}
    />
  )
}

CodeMirrorField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired
}
