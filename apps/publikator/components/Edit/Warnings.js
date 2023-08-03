import { css } from 'glamor'
import { plainButtonRule } from '@project-r/styleguide'
import { EDITOR_TOOLBAR_HEIGHT } from '@project-r/styleguide/editor'
import { HEADER_HEIGHT } from '../Frame/constants'
import { createContext, useContext, useState } from 'react'
import { timeFormat } from 'd3-time-format'
import { IconClose } from '@republik/icons'

const styles = {
  warnings: css({
    position: 'fixed',
    right: 5,
    top: HEADER_HEIGHT + EDITOR_TOOLBAR_HEIGHT + 5,
    width: 300,
    zIndex: 22,
  }),
  warning: css({
    backgroundColor: 'var(--color-error)',
    color: '#fff',
    marginBottom: 5,
    padding: '5px 25px 5px 5px',
    position: 'relative',
  }),
  time: css({
    marginRight: 5,
  }),
  remove: css(plainButtonRule, {
    position: 'absolute',
    right: 5,
    top: 0,
  }),
}

const formatTime = timeFormat('%H:%M')

const WarningContext = createContext([])

export const useWarningContext = () => useContext(WarningContext)

export const WarningContextProvider = ({ children }) => {
  const [warnings, setWarnings] = useState([])

  const addWarning = (message) => {
    const time = formatTime(new Date())
    setWarnings(
      [{ time, message }, ...warnings].filter(
        // de-dup
        ({ message }, i, all) =>
          all.findIndex((w) => w.message === message) === i,
      ),
    )
  }

  const rmWarning = (message) =>
    setWarnings(warnings.filter((warning) => warning.message !== message))

  return (
    <WarningContext.Provider
      value={{
        warnings,
        addWarning,
        rmWarning,
      }}
    >
      {children}
    </WarningContext.Provider>
  )
}

const Warning = ({ warning }) => {
  const { rmWarning } = useWarningContext()
  return (
    <div {...styles.warning}>
      <b {...styles.time}>{warning.time}</b> {warning.message}
      <button {...styles.remove} onClick={() => rmWarning(warning.message)}>
        <IconClose />
      </button>
    </div>
  )
}

export const Warnings = () => {
  const { warnings } = useWarningContext()
  if (!warnings?.length) return null
  return (
    <div {...styles.warnings}>
      {warnings.map((warning, i) => (
        <Warning key={`warning-${i}`} warning={warning} />
      ))}
    </div>
  )
}
