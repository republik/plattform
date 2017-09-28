import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { renderMdast } from './'

// monkey patch react 15
// can be removed with react 16
import 'react-dom'
import DOMProperty from 'react-dom/lib/DOMProperty'

const emailAttributes = {
  Properties: {
    align: 0,
    valign: 0,
    bgcolor: 0,
    border: 0
  }
}

DOMProperty.injection.injectDOMPropertyConfig(emailAttributes)

export const Mso = ({children, gte}) =>
  <mso data-gte={gte} dangerouslySetInnerHTML={{
    __html: children
  }} />

const DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'

export const renderEmail = (mdast, schema = {}) => (
  DOCTYPE +
  ReactDOMServer.renderToStaticMarkup(
    renderMdast(mdast, schema)
  )
    .split('<mso>')
    .join('<!--[if mso]>')
    .split('<mso data-gte="15">')
    .join('<!--[if gte mso 15]>')
    .split('</mso>')
    .join('<![endif]-->')
)
