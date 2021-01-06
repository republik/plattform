import React, { useState } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { colors, fontFamilies, Label } from '@project-r/styleguide'

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
    padding: '10px 0',
    '& .CodeMirror': {
      height: 'auto',
      margin: '10px 80px 20px 0',
      fontFamily: fontFamilies.monospaceRegular,
      fontSize: 14,
      color: colors.text
    },
    '& .CodeMirror-lines': {
      backgroundColor: colors.light.hover,
      paddingTop: 7,
      paddingBottom: 6,
      minHeight: 40
    },
    '& .CodeMirror-cursor': {
      width: 1,
      background: colors.light.text
    }
  })
}

const CodeMirrorField = ({ label, value, onChange, onPaste, options }) => (
  <div {...styles.codemirror}>
    <Label style={{ paddingLeft: 5 }}>{label}</Label>
    <CodeMirror
      value={value}
      options={options}
      onBeforeChange={(editor, data, value) => {
        onChange(value)
      }}
      onPaste={(editor, event) => {
        onPaste && onPaste(event)
      }}
    />
  </div>
)

export const PlainEditor = ({ label, value, onChange, onPaste, mode }) => (
  <CodeMirrorField
    label={label}
    value={value}
    options={{
      mode: mode || 'text',
      theme: 'neo',
      gutters: ['CodeMirror-linenumbers'],
      lineNumbers: true,
      line: true,
      lineWrapping: true
    }}
    onChange={value => {
      onChange(value)
    }}
    onPaste={event => {
      onPaste(event)
    }}
  />
)

export const JSONEditor = ({ label, value, onChange }) => {
  const [stateValue, setStateValue] = useState(undefined)

  return (
    <CodeMirrorField
      label={label}
      value={
        stateValue === undefined ? JSON.stringify(value, null, 2) : stateValue
      }
      options={{
        mode: 'application/json',
        theme: 'neo',
        gutters: ['CodeMirror-linenumbers'],
        lineNumbers: true,
        line: true,
        lint: true,
        matchBrackets: true,
        autoCloseBrackets: true
      }}
      onChange={value => {
        let json
        try {
          json = JSON.parse(value)
        } catch (e) {}
        if (json) {
          onChange(json)
        }

        if (stateValue !== value) {
          setStateValue(value)
        }
      }}
    />
  )
}

CodeMirrorField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired
}
