import * as React from 'react'
import { colors } from '@project-r/styleguide'
import {
  swissTime,
  chfFormat
} from '../../../lib/utils/formats'

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

const dateFormat = swissTime.format('%e. %B %Y')

export default props =>
  props.entries.map(entry => (
    <div>
      <span>
        {entry.type.split('_').join(' ')}
      </span>
      <span>
        {dateTimeFormat(
          new Date(entry.createdAt)
        )}
      </span>
      <span>{entry.archivedSession.email}</span>
      <span>
        {entry.archivedSession.userAgent}
      </span>
      <span>
        {entry.activeSession &&
        entry.activeSession.isCurrent
          ? 'YES'
          : 'NO'}
      </span>
    </div>
  ))
