import { useMemo } from 'react'
import visit from 'unist-util-visit'
import isUUID from 'is-uuid'
import { parse } from 'url'
import { FRONTEND_BASE_URL } from '../../lib/settings'
import { mdastToString } from '../../lib/utils/helpers'

import { Editorial } from '@project-r/styleguide'
import { SOCIAL_MEDIA } from '../editor/modules/meta/ShareImageForm'

const FRONTEND_HOSTNAME = FRONTEND_BASE_URL && parse(FRONTEND_BASE_URL).hostname

const useValidation = ({ meta, content, t, updateMailchimp }) => {
  const links = useMemo(() => {
    const all = []
    visit(content, 'link', (node) => {
      if (!node?.url) {
        return
      }

      const urlObject = parse(node.url)
      const warnings = []
      const errors = []

      if (!node.url || !node.url.trim()) {
        errors.push('empty')
      } else {
        if (urlObject.path) {
          if (
            !urlObject.protocol &&
            urlObject.path[0] !== '/' &&
            urlObject.path[0] !== '#' &&
            urlObject.path[0] !== '?'
          ) {
            errors.push('relative')
          }
          if (urlObject.pathname.endsWith('.webp')) {
            warnings.push('webp')
          }
          if (
            (!urlObject.protocol || FRONTEND_HOSTNAME === urlObject.hostname) &&
            urlObject.path.startsWith('/~')
          ) {
            const slug = urlObject.pathname.split('~')[1]
            if (!isUUID.v4(slug)) {
              warnings.push('profiles')
            }
          }
        }
        if (urlObject.hostname) {
          if (
            urlObject.hostname.startsWith('ww.') ||
            urlObject.hostname.startsWith('wwww.')
          ) {
            warnings.push('wwwws')
          }
        }
      }

      all.push({
        url: node.url,
        text: mdastToString(node),
        warnings,
        errors,
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
      t('publish/validation/emailSubject/empty'),
  ].filter(Boolean)

  const socialWarnings = SOCIAL_MEDIA.map(
    (socialKey) =>
      !meta.shareText &&
      !meta[`${socialKey}Image`] &&
      !meta.image &&
      t(`publish/validation/${socialKey}Image/empty`),
  )

  const warnings = []
    .concat(
      meta.template !== 'front'
        ? [
            !meta.title && t('publish/validation/title/empty'),
            !meta.description && t('publish/validation/description/empty'),
          ]
            .concat(socialWarnings)
            .filter(Boolean)
        : [],
    )
    .concat(
      links
        .filter(({ warnings }) => warnings.length)
        .reduce(
          (all, link) =>
            all.concat(
              link.warnings.map((warning) =>
                t.elements('publish/validation/link/warning', {
                  text: link.text,
                  link: (
                    <Editorial.A
                      key='link'
                      href={link.url}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {link.url}
                    </Editorial.A>
                  ),
                  reason: t(`publish/validation/link/issue/${warning}`),
                }),
              ),
            ),
          [],
        ),
    )
    // to start we do not block any publication
    .concat(
      links
        .filter(({ errors }) => errors.length)
        .reduce(
          (all, link) =>
            all.concat(
              link.errors.map((error) =>
                t.elements('publish/validation/link/error', {
                  text: link.text,
                  link: (
                    <Editorial.A
                      key='link'
                      href={link.url}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {link.url}
                    </Editorial.A>
                  ),
                  reason: t(`publish/validation/link/issue/${error}`),
                }),
              ),
            ),
          [],
        ),
    )

  return { errors, warnings, links }
}

export default useValidation
