import { A } from '@project-r/styleguide'

import { styles } from './utils'

const Info = ({ email, name }) => (
  <div {...styles.hint}>
    Suche{' '}
    <A href={`/users?search=${encodeURI(email || name)}`} target='_blank'>
      E-Mail-Adresse
    </A>
    {' · '}
    <A href={`/users?search=${encodeURI(name || email)}`} target='_blank'>
      Name
    </A>
    {' · '}
    <A href={`/mailbox?search=${encodeURI(email)}`} target='_blank'>
      E-Mails
    </A>
  </div>
)

export default Info
