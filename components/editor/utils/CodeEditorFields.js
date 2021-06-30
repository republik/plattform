import React, { useEffect, useMemo, useRef, useState } from 'react'
import { css, merge } from 'glamor'
import PropTypes from 'prop-types'
import { Controlled as CodeMirror } from 'react-codemirror2'
import {
  A,
  colors,
  fontFamilies,
  Label,
  useDebounce
} from '@project-r/styleguide'

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

const LINE_HEIGHT = 21

const styles = {
  codemirror: css({
    padding: 0,
    '& .CodeMirror': {
      height: 'auto',
      margin: '10px 0 20px',
      fontFamily: fontFamilies.monospaceRegular,
      fontSize: 14,
      color: colors.text
    },
    '& .CodeMirror-lines': {
      backgroundColor: colors.light.hover
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
        '& .CodeMirror': scroll && {
          height: Math.round(LINE_HEIGHT * linesShown),
          overflowY: 'scroll'
        }
      }),
    [scroll]
  )
  const showLabel = label || linesShown
  return (
    <div {...merge(styles.codemirror, style)}>
      {showLabel && (
        <Label>
          {label && <span>{label}</span>}
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
      )}
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

export const PlainEditor = ({
  label,
  value,
  onChange,
  onPaste,
  mode,
  linesShown,
  readOnly
}) => {
  return (
    <CodeMirrorField
      label={label}
      value={value}
      linesShown={linesShown}
      options={{
        mode: mode || 'text',
        readOnly
      }}
      onChange={onChange}
      onPaste={onPaste}
    />
  )
}

const stringify = json => (json ? JSON.stringify(json, null, 2) : '')

export const JSONEditor = ({
  label,
  config,
  onChange,
  linesShown,
  readOnly
}) => {
  const [stateValue, setStateValue] = useState('')
  const [debouncedStateValue] = useDebounce(stateValue, 300)
  const configRef = useRef()
  configRef.current = config
  const valueRef = useRef()
  valueRef.current = stateValue

  useEffect(() => {
    let json
    try {
      json = JSON.parse(debouncedStateValue)
    } catch (e) {}
    if (json) {
      onChange(json)
    }
  }, [debouncedStateValue])

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
