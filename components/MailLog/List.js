import {
  Label,
  A
} from '@project-r/styleguide'

import routes from '../../server/routes'

import { displayDateTime, displayDate } from '../Display/utils'
import { tableStyles } from '../Tables/utils'

import Status from './Status'

const { Link } = routes

const List = ({ nodes, narrow = false }) => (
  <table {...tableStyles.table}>
    {!narrow ? (
      <colgroup>
        <col style={{ width: '15%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '50%' }} />
        <col style={{ width: '10%' }} />
      </colgroup>
    ) : (
      <colgroup>
        <col style={{ width: '30%' }} />
        <col style={{ width: '70%' }} />
      </colgroup>
    )}
    <tbody>
      {nodes.map(mail => (
        <tr key={mail.id} {...tableStyles.row}>
          <td {...tableStyles.paddedCell}>
            {displayDateTime(mail.createdAt)}
            <Status status={mail.status} error={mail.error} />
          </td>
          {!narrow && (
            <td {...tableStyles.paddedCell}>
              {mail.user 
                ? <>
                  <div>
                    <Link
                      route='user'
                      params={{userId: mail.user.id}}
                      passHref>
                      <A>
                        {`${mail.user.name} (${mail.email})`}
                      </A>
                    </Link>
                  </div>
                  <Label>Created: {displayDate(mail.user.createdAt)}</Label>
                </>
                : mail.email
              }
            </td>
          )}
          <td {...tableStyles.paddedCell}>
            {mail.subject
              ? <>
                <div>{mail.subject}</div>
                <Label>
                  {mail.template || mail.type}
                  {!narrow && <> · ID: {mail.id}</>}
                </Label>
              </>
              : <>
                <div>{mail.template || mail.type}</div>
                <Label>ID: {mail.id}</Label>
              </>
            }
          </td>
          {!narrow && (
            <td>
              {mail.mandrill && mail.mandrill.map(({ label, url }) => (
                <div key={`${label}-${url}`}>
                  <A href={url} target="_blank">
                    {label}
                  </A>
                </div>
              ))}
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
)

export default List