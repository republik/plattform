import { createFormatter } from '@project-r/styleguide'

export const t = createFormatter(require('./translations.json').data)

const withT = (Component) => (props) => <Component {...props} t={t} />

export default withT

export function useTranslation() {
  return { t }
}
