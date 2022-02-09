import React from 'react'
import { createFormatter } from '@project-r/styleguide'
import translations from './translations.json'

export const t = createFormatter(translations.data)

const withT = (Component) => (props) => <Component {...props} t={t} />

export default withT

export function useTranslation() {
  return { t }
}
