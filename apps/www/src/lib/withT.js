import { createFormatter } from './translate'
import translations from './translations.json'

export const t = createFormatter(translations.data)

const withT = (Component) => (props) => <Component {...props} t={t} />

export default withT

export function useTranslation() {
  return { t }
}
