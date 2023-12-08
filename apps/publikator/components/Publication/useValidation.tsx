import { useMemo } from 'react'
import visit from 'unist-util-visit'
import { v4 as uuid, validate as validateUUID } from 'uuid'
import { mdastToString } from '../../lib/utils/helpers'

import { SOCIAL_MEDIA } from '../editor/modules/meta/ShareImageForm'

import { Editorial, renderSlateAsText } from '@project-r/styleguide'

// Used to check for relative urls
const FAKE_BASE_URL = `http://${uuid()}.local`

const useValidation = ({ meta, content, t, updateMailchimp }) => {
  const links = useMemo(() => {
    const isFlyer = meta.template === 'flyer'
    const toText = isFlyer
      ? (node) => renderSlateAsText(node.children)
      : mdastToString
    const urlKey = isFlyer ? 'href' : 'url'
    const all = []
    visit(content, 'link', (node) => {
      const warnings = []
      const errors = []

      if (!node?.[urlKey]?.trim()) {
        errors.push('empty')
      } else {
        try {
          const urlObject = new URL(node[urlKey], FAKE_BASE_URL)

          // Is it a relative url?
          if (urlObject.origin === FAKE_BASE_URL) {
            // Profile urls are ok when relative, but only if they're a UUID
            if (urlObject.pathname.startsWith('/~')) {
              const slug = urlObject.pathname.split('~')[1]
              if (!validateUUID(slug)) {
                warnings.push('profiles')
              }
            } else {
              errors.push('relative')
            }
          }
          // WebP?
          if (urlObject.pathname.endsWith('.webp')) {
            warnings.push('webp')
          }
          // Uhhhh really?
          if (
            urlObject.hostname.startsWith('ww.') ||
            urlObject.hostname.startsWith('wwww.')
          ) {
            warnings.push('wwwws')
          }
        } catch (e) {
          console.log('Error validating URL', e)
        }
      }

      all.push({
        url: node[urlKey],
        text: toText(node),
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
