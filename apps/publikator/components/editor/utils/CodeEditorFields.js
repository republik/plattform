import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { fontStyles, Label, useColorContext } from '@project-r/styleguide'
import debounce from 'lodash/debounce'

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

const LINE_HEIGHT = 20.4

const CodeMirrorField = ({
  label,
  error,
  value,
  onChange,
  onPaste,
  options,
  onFocus,
  onBlur,
  linesShown,
}) => {
  const [colorScheme] = useColorContext()
  const showLabel = label || linesShown || error

  const codemirrorRule = useMemo(
    () =>
      css({
        marginBottom: 20,
        padding: 0,
        '& .CodeMirror': {
          height: 'auto',
          ...fontStyles.monospaceRegular,
          fontSize: 14,
          color: colorScheme.getCSSColor('text'),
        },
        '& .CodeMirror-lines': {
          backgroundColor: colorScheme.getCSSColor('hover'),
        },
        '& .CodeMirror-cursor': {
          width: 1,
          background: colorScheme.getCSSColor('text'),
        },
      }),
    [colorScheme],
  )

  return (
    <div {...codemirrorRule}>
      {showLabel && (
        <div style={{ marginBottom: 10 }}>
          <Label>
            {error ? (
              <span {...colorScheme.set('color', 'error')}>{error}</span>
            ) : (
              label
            )}
          </Label>
        </div>
      )}
      <div
        style={
          linesShown
            ? {
                maxHeight: Math.round(LINE_HEIGHT * linesShown),
                overflowY: 'scroll',
              }
            : null
        }
      >
        <CodeMirror
          value={value}
          options={{
            theme: 'neo',
            gutters: ['CodeMirror-linenumbers'],
            lineNumbers: true,
            line: true,
            lineWrapping: true,
            ...options,
          }}
          onBeforeChange={(_, __, value) => {
            onChange(value)
          }}
          onPaste={(_, event) => {
            onPaste && onPaste(event)
          }}
          onBlur={(_, event) => {
            onBlur && onBlur(event)
          }}
          onFocus={(_, event) => {
            onFocus && onFocus(event)
          }}
        />
      </div>
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
  readOnly,
}) => {
  return (
    <CodeMirrorField
      label={label}
      value={value}
      linesShown={linesShown}
      options={{
        mode: mode || 'text',
        readOnly,
      }}
      onChange={onChange}
      onPaste={onPaste}
    />
  )
}

const stringify = (json) => (json ? JSON.stringify(json, null, 2) : '')
const safeParse = (string) => {
  let json
  try {
    json = JSON.parse(string)
  } catch (e) {}
  return json
}

export const JSONEditor = ({
  label,
  config,
  onChange,
  linesShown,
  readOnly,
}) => {
  const [isEditing, setEditing] = useState()
  const [stateValue, setStateValue] = useState(stringify(config))

  // we need to use a ref for invalid because
  // onBlur and onFocus callbacks are not refreshed
  // as of react-codemirror2 7.2.1
  const validJsonRef = useRef(safeParse(stateValue))
  const [isValid, setIsValid] = useState(!!validJsonRef.current)
  const onChangeRef = useRef()
  onChangeRef.current = onChange

  // slowly save valid json on change (immediately flushed on blur)
  const slowSave = useCallback(
    debounce(() => {
      setIsValid(!!validJsonRef.current)
      if (validJsonRef.current && onChangeRef.current) {
        onChangeRef.current(validJsonRef.current)
      }
    }, 500),
    [],
  )

  // set editor text with well formatted config from saved state when not isEditing
  useEffect(() => {
    if (!isEditing) {
      setStateValue(stringify(config))
    }
  }, [isEditing, config])

  return (
    <CodeMirrorField
      onFocus={() => {
        setEditing(true)
      }}
      onBlur={() => {
        if (validJsonRef.current) {
          // immediately run pending save
          slowSave.flush()
          setEditing(false)
        }
      }}
      label={label}
      error={!isValid && `${label} ungültig, JSON invalid`}
      value={stateValue}
      linesShown={linesShown}
      options={{
        mode: 'application/json',
        lint: true,
        matchBrackets: true,
        // autoCloseBrackets: true,
        autofocus: true,
        readOnly,
      }}
      onChange={(newValue) => {
        setStateValue(newValue)
        validJsonRef.current = safeParse(newValue)
        slowSave()
      }}
    />
  )
}

CodeMirrorField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
}
