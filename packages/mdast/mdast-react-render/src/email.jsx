import * as ReactDOMServer from 'react-dom/server'

import { renderMdast } from './'

export const Mso = ({ children, gte }) => (
  <mso
    data-gte={gte}
    dangerouslySetInnerHTML={{
      __html: children,
    }}
  />
)

const DEFAULT_DOCTYPE =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'

export const renderEmail = (mdast, schema, options = {}) => {
  const { doctype = DEFAULT_DOCTYPE } = options
  return (
    doctype +
    ReactDOMServer.renderToStaticMarkup(renderMdast(mdast, schema, options))
      .split('<mso>')
      .join('<!--[if mso]>')
      .replace(
        /<mso data-gte="([^""]+)">/,
        (match, gte) => `<!--[if gte mso ${gte}]>`,
      )
      .split('</mso>')
      .join('<![endif]-->')
  )
}
