import { createFormatter } from '@project-r/styleguide'

export const vt = createFormatter(require('./translations-vote.json').data)

const voteT = (Component) => (props) => <Component {...props} vt={vt} />
export default voteT
