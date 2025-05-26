type MailSettingKey =
  | 'confirm:revoke_cancellation'
  | 'confirm:setup'
  | 'confirm:cancel'
  | 'notice:ended'
type MailSettings = Record<MailSettingKey, boolean>

export const REPUBLIK_PAYMENTS_MAIL_SETTINGS_KEY =
  'republik.payments.mail.settings'

const baseSettings: MailSettings = {
  'notice:ended': true,
  'confirm:revoke_cancellation': true,
  'confirm:cancel': true,
  'confirm:setup': true,
}

export function getMailSettings(overwriteString?: string) {
  const settings = { ...baseSettings }

  if (!overwriteString) {
    return settings
  }

  for (const setting of overwriteString.split(',')) {
    const [name, value] = setting.split('=')
    if (name in settings) {
      settings[name as MailSettingKey] = parseValue(value)
    }
  }

  return settings
}

function parseValue(value: string) {
  switch (value) {
    case 'true':
    case 'enabled':
    case 'on':
      return true
    case 'false':
    case 'disabled':
    case 'off':
      return false
    default:
      return true
  }
}

export function serializeMailSettings(settings: Partial<MailSettings>) {
  return Object.keys(settings)
    .map((s) => {
      return `${s}=${settings[s as MailSettingKey]}`
    })
    .join(',')
}
