import React from 'react'
import { css, merge } from 'glamor'

import {
  A,
  Label,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  colors
} from '@project-r/styleguide'

import { displayDateTime } from '../Display/utils'
import Address, { Bucket as AddressBucket } from './Address'

const styles = {
  headerLine: css({
    marginBottom: 10
  }),
  errornous: css({
    color: colors.error
  }),
  contentFrame: css({
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    height: '500px'
  })
}

const HeaderLine = ({ label, errornous, children }) => {
  const styling = merge(styles.headerLine, errornous && styles.errornous)

  return (
    <div {...styling}>
      <Label>{label}</Label> {children}
    </div>
  )
}

const Mail = props => {
  const { mail, onClose } = props

  return (
    <Overlay onClose={onClose}>
      <OverlayToolbar onClose={onClose} />
      <OverlayBody>
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
        {mail.subject && (
          <HeaderLine label='Betreff'>{mail.subject}</HeaderLine>
        )}
        <HeaderLine label='Datum'>{displayDateTime(mail.date)}</HeaderLine>
        {mail.html && (
          <iframe
            frameBorder='0'
            src={`data:text/html;base64,${mail.html}`}
            {...styles.contentFrame}
          />
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
        {mail.links?.map(link => (
          <HeaderLine key={link.id} label='Link'>
            <A href={link.url} target='_blank'>
              {link.label}
            </A>
          </HeaderLine>
        ))}
        <HeaderLine label='Typ'>{mail.template || mail.type}</HeaderLine>
        <HeaderLine label='ID'>{mail.id}</HeaderLine>
      </OverlayBody>
    </Overlay>
  )
}

export default Mail
