import { APP_OPTIONS } from '../../../lib/constants'
import { Label } from '@project-r/styleguide'

export const DISCUSSION_NOTIFICATION_CHANNELS = [
  'EMAIL',
  APP_OPTIONS && 'APP',
].filter(Boolean)

export const DISCUSSION_NOTIFICATION_OPTIONS = ['MY_CHILDREN', 'ALL', 'NONE']

export const composerHints = (t) => [
  function formattingAsterisk(text) {
    // Match where asterisk is within a word (not next to whitespace)
    // "n*n" is a match, " *n" and "n** " are not
    const hasUnescapedAsterisk = !!text.match(/[^\\*\s:]\*[^*\s:]/)
    if (hasUnescapedAsterisk) {
      return (
        <Label>{t('styleguide/CommentComposer/formatting/asterisk')}</Label>
      )
    }
    return false
  },
]
