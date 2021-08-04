import React, { useState } from 'react'
import { Label, A } from '@project-r/styleguide'

import { displayDateTime } from '../Display/utils'
import { tableStyles } from '../Tables/utils'

import Status from './Status'
import Mail from './Mail'
import Address, { Bucket as AddressBucket } from './Address'

import { MAILBOX_SELF } from '../../server/constants'

const self = MAILBOX_SELF?.split(',')

const Row = ({ mail, narrow }) => {
  const [showEmail, setShowEmail] = useState()

  const from =
    mail.from?.address && !self.includes(mail.from.address) && mail.from
  const to = mail.to?.filter(({ address }) => !self.includes(address))

  const show = e => {
    e?.preventDefault()
    setShowEmail(true)
  }

  const hide = e => {
    e?.preventDefault()
    setShowEmail(false)
  }

  return (
    <>
      <tr key={mail.id} {...tableStyles.row}>
        <td {...tableStyles.paddedCell}>
          {displayDateTime(mail.date)}
          <Status status={mail.status} error={mail.error} onClick={show} />
        </td>
        <td {...tableStyles.paddedCell}>
          <A href='#' onClick={show}>
            {mail.subject || mail.template || mail.type}
          </A>
          {showEmail && <Mail mail={mail} onClose={hide} />}
        </td>
        {!narrow && (
          <td {...tableStyles.paddedCell}>
            {!!from && (
              <div>
                <Label>Von</Label> <Address address={from} />
              </div>
            )}
            {!!to?.length && (
              <div>
                <Label>An</Label> <AddressBucket addresses={to} />
              </div>
            )}
          </td>
        )}
      </tr>
    </>
  )
}

const List = ({ nodes, narrow = false }) => (
  <table {...tableStyles.table}>
    {!narrow ? (
      <colgroup>
        <col style={{ width: '15%' }} />
        <col style={{ width: '50%' }} />
        <col style={{ width: '45%' }} />
      </colgroup>
    ) : (
      <colgroup>
        <col style={{ width: '30%' }} />
        <col style={{ width: '70%' }} />
      </colgroup>
    )}
    <tbody>
      {nodes.map(mail => (
        <Row key={mail.id} mail={mail} narrow={narrow} />
      ))}
    </tbody>
  </table>
)

export default List
