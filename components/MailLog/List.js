import {
  Label,
  A
} from '@project-r/styleguide'

import routes from '../../server/routes'

import { displayDateTime } from '../Display/utils'
import { tableStyles } from '../Tables/utils'

import Status from './Status'

const { Link } = routes

const List = ({ nodes }) => (
  <table {...tableStyles.table}>
    <colgroup>
      <col style={{ width: '15%' }} />
      <col style={{ width: '25%' }} />
      <col style={{ width: '50%' }} />
      <col style={{ width: '10%' }} />
    </colgroup>
    <tbody>
      {nodes.map(mail => (
        <tr key={mail.id} {...tableStyles.row}>
          <td {...tableStyles.paddedCell}>
            {displayDateTime(mail.createdAt)}
            <Status status={mail.status} error={mail.error} />
          </td>
          <td {...tableStyles.paddedCell}>
            {mail.user 
              ? <>
                <Link
                  route='user'
                  params={{userId: mail.user.id}}
                  passHref>
                  <A>
                    {`${mail.user.name} (${mail.email})`}
                  </A>
                </Link>
              </>
              : mail.email
            }
          </td>
          <td {...tableStyles.paddedCell}>
            {mail.subject
              ? <>
                <div>{mail.subject}</div>
                <Label>{mail.template || mail.type} · ID: {mail.id}</Label>
              </>
              : <>
                <div>{mail.template || mail.type}</div>
                <Label>ID: {mail.id}</Label>
              </>
            }
          </td>
          <td>
            {mail.mandrill && mail.mandrill.map(({ label, url }) => (
              <div>
                <A key={`${label}-${url}`} href={url} target="_blank">
                  {label}
                </A>
              </div>
            ))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default List