import React, { useState } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import AutosizeInput from 'react-textarea-autosize'
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
  autoSize: css({
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    fontFamily: 'Courier, Courier New, monospace !important',
    fontSize: '14px !important'
  }),
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
      padding: 5
    }
  })
}

export const NumberedField = ({ label, value, onChange, onPaste, mode }) => (
  <div {...styles.codemirror}>
    <Label style={{ paddingLeft: 5 }}>{label}</Label>
    <CodeMirror
      value={value}
      options={{
        mode: mode || 'text',
        theme: 'neo',
        gutters: ['CodeMirror-linenumbers'],
        lineNumbers: true,
        line: true,
        lineWrapping: true
      }}
      onBeforeChange={(editor, data, value) => {
        onChange(value)
      }}
      onPaste={(editor, event) => {
        onPaste && onPaste(event)
      }}
    />
  </div>
)

const JSONField = ({ label, value, onChange }) => {
  const [stateValue, setStateValue] = useState(undefined)

  return (
    <div {...styles.codemirror}>
      <Label style={{ paddingLeft: 5 }}>{label}</Label>
      <CodeMirror
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
        onBeforeChange={(editor, data, value) => {
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
    </div>
  )
}

JSONField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

export default JSONField
