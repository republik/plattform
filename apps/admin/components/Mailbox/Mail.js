import { gql } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import { css, cx } from '@republik/theme/css'

import {
  A,
  Label,
  Loader,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'

import { displayDateTime } from '@/components/Display/utils'
import Address, { Bucket as AddressBucket } from './Address'
import { fragments } from './utils'

const GET_MAILBOX_HTML = gql`
  query getMailboxHtml($id: ID) {
    mailbox(first: 1, filters: { id: $id }) {
      nodes {
        ...MailboxHtml
      }
    }
  }

  ${fragments.html}
`

const styles = {
  headerLine: css({
    marginBottom: 10,
    overflowWrap: 'anywhere',
    whiteSpace: 'normal',
  }),
  errornous: css({
    color: 'error',
  }),
  contentFrame: css({
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    height: '500px',
  }),
}

const HeaderLine = ({ label, errornous, children }) => {
  return (
    <div className={cx(styles.headerLine, errornous && styles.errornous)}>
      <Label>{label}</Label> {children}
    </div>
  )
}

export const Body = ({ mail }) => (
  <>
    {mail.from && (
      <HeaderLine label='Von'>
        <Address address={mail.from} />
      </HeaderLine>
    )}
    {mail.to && (
      <HeaderLine label='An'>
        <AddressBucket addresses={mail.to} />
      </HeaderLine>
    )}
    {mail.cc && (
      <HeaderLine label='Kopie'>
        <AddressBucket addresses={mail.cc} />
      </HeaderLine>
    )}
    {mail.bcc && (
      <HeaderLine label='Blindkopie'>
        <AddressBucket addresses={mail.bcc} />
      </HeaderLine>
    )}
    {mail.subject && <HeaderLine label='Betreff'>{mail.subject}</HeaderLine>}
    <HeaderLine label='Datum'>{displayDateTime(mail.date)}</HeaderLine>
    {mail.hasHtml && (
      <Query query={GET_MAILBOX_HTML} variables={{ id: mail.id }}>
        {({ loading, error, data }) => (
          <Loader
            loading={loading}
            error={error}
            render={() => {
              const mail = data.mailbox.nodes[0]

              return (
                mail.html && (
                  <iframe
                    frameBorder='0'
                    sandbox={''}
                    srcDoc={mail.html}
                    className={styles.contentFrame}
                  />
                )
              )
            }}
          />
        )}
      </Query>
    )}
    {mail.status && mail.status !== 'sent' && (
      <HeaderLine label='Status' errornous={!!mail.error}>
        {mail.status}
      </HeaderLine>
    )}
    {mail.status && mail.status !== 'sent' && mail.error && (
      <HeaderLine label='Fehler' errornous>
        {mail.error}
      </HeaderLine>
    )}
    {mail.links?.map((link) => (
      <HeaderLine key={link.id} label='Link'>
        <A href={link.url} target='_blank'>
          {link.label}
        </A>
      </HeaderLine>
    ))}
    <HeaderLine label='Typ'>{mail.template || mail.type}</HeaderLine>
    <HeaderLine label='ID'>{mail.id}</HeaderLine>
  </>
)

const Mail = (props) => {
  const { mail, onClose } = props

  return (
    <Overlay onClose={onClose}>
      <OverlayToolbar onClose={onClose} />
      <OverlayBody>
        <Body mail={mail} />
      </OverlayBody>
    </Overlay>
  )
}

export default Mail
