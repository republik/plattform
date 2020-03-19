import React from 'react'
import visit from 'unist-util-visit'
import isUUID from 'is-uuid'
import { parse } from 'url'
import { FRONTEND_BASE_URL } from '../../lib/settings'

const mdastToString = node =>
  node
    ? node.value ||
      (node.children && node.children.map(mdastToString).join('')) ||
      ''
    : ''

const FRONTEND_HOSTNAME = FRONTEND_BASE_URL && parse(FRONTEND_BASE_URL).hostname

const useValidation = ({ meta, content, t, updateMailchimp }) => {
  const links = React.useMemo(() => {
    const all = []
    visit(content, 'link', node => {
      const urlObject = parse(node.url)
      let error // to start we only do warning
      let warning

      if (!node.url || !node.url.trim()) {
        warning = 'leerer URL' // error
      } else {
        if (urlObject.path) {
          if (
            !urlObject.protocol &&
            urlObject.path[0] !== '/' &&
            urlObject.path[0] !== '#' &&
            urlObject.path[0] !== '?'
          ) {
            warning =
              'relative Links sind unzulässig, ging «https://» vergessen?' // error
          }
          if (urlObject.pathname.endsWith('.webp')) {
            warning = '.webp-Dateien funktionieren nicht überall.'
          }
          if (
            (!urlObject.protocol || FRONTEND_HOSTNAME === urlObject.hostname) &&
            urlObject.path.startsWith('/~')
          ) {
            const slug = urlObject.pathname.split('~')[1]
            if (!isUUID.v4(slug)) {
              warning = 'Profile sollten immer via ID verlinkt werden'
            }
          }
        }
        if (urlObject.hostname) {
          if (
            urlObject.hostname.startsWith('ww.') ||
            urlObject.hostname.startsWith('wwww.')
          ) {
            warning = 'richtige Anzahl Ws?'
          }
        }
      }

      all.push({
        url: node.url,
        text: mdastToString(node),
        error,
        warning
      })
    })
    return all
  }, [content])

  const errors = [
    meta.template !== 'front' &&
      !meta.slug &&
      t('publish/validation/slug/empty'),
    updateMailchimp &&
      !meta.emailSubject &&
      t('publish/validation/emailSubject/empty')
  ]
    .filter(Boolean)
    .concat(
      links
        .filter(link => link.error)
        .map(
          link => `Ungültiger Link: [${link.text}](${link.url}) – ${link.error}`
        )
    )

  const warnings = []
    .concat(
      meta.template !== 'front'
        ? [
            !meta.title && t('publish/validation/title/empty'),
            !meta.description && t('publish/validation/description/empty'),
            !meta.facebookImage &&
              !meta.image &&
              t('publish/validation/facebookImage/empty'),
            !meta.twitterImage &&
              !meta.image &&
              t('publish/validation/twitterImage/empty')
          ].filter(Boolean)
        : []
    )
    .concat(
      links
        .filter(link => link.warning)
        .map(
          link =>
            `Suspekter Link: [${link.text}](${link.url}) – ${link.warning}`
        )
    )

  return { errors, warnings, links }
}

export default useValidation
