import { css, cx } from '@republik/theme/css'
import { useState } from 'react'

import { A, Label } from '@project-r/styleguide'

import { displayDateTime } from '@/components/Display/utils'
import { tableStyles } from '@/components/Tables/utils'

import Address, { Bucket as AddressBucket } from './Address'
import Mail from './Mail'

import { IconCallReceived, IconError } from '@republik/icons'
import { MAILBOX_SELF } from '@/server/constants'

const self = MAILBOX_SELF?.split(',') ?? []

const styles = {
  icon: css({
    verticalAlign: 'baseline',
    marginRight: 5,
    marginBottom: '-0.2em',
    fontSize: '1.2em',
    color: 'text',
  }),
  error: css({
    color: 'error',
  }),
}

export const Date = ({ mail }) => displayDateTime(mail.date)

export const Subject = ({ mail }) => {
  const hasFrom = !!mail.from?.address
  const isSelfSent = self.includes(mail.from?.address)

  return (
    <>
      {hasFrom && !isSelfSent && <IconCallReceived className={styles.icon} />}
      {mail.status !== 'sent' && mail.error && (
        <IconError className={cx(styles.icon, styles.error)} />
      )}
      {mail.subject || mail.template || mail.type}
    </>
  )
}

const Row = ({ mail, narrow }) => {
  const [showEmail, setShowEmail] = useState()

  const from =
    mail.from?.address && !self.includes(mail.from.address) && mail.from
  const to = mail.to?.filter(({ address }) => !self.includes(address))

  const show = (e) => {
    e?.preventDefault()
    setShowEmail(true)
  }

  const hide = (e) => {
    e?.preventDefault()
    setShowEmail(false)
  }

  return (
    <tr key={mail.id} className={tableStyles.row}>
      <td className={tableStyles.paddedCell}>
        <Date mail={mail} />
      </td>
      <td className={tableStyles.paddedCell}>
        <A href={`/mailbox?mailId=${mail.id}`} target='_blank' onClick={show}>
          <Subject mail={mail} />
        </A>
        {showEmail && <Mail mail={mail} onClose={hide} />}
      </td>
      {!narrow && (
        <td className={tableStyles.paddedCell}>
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
  )
}

const List = ({ nodes, narrow = false }) => (
  <table className={tableStyles.table}>
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
      {nodes.map((mail) => (
        <Row key={mail.id} mail={mail} narrow={narrow} />
      ))}
    </tbody>
  </table>
)

export default List
