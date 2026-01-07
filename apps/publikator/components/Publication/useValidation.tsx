import { useMemo } from 'react'
import visit from 'unist-util-visit'
import { v4 as uuid, validate as validateUUID } from 'uuid'

import { SOCIAL_MEDIA } from '../editor/modules/meta/ShareImageForm'

import { Editorial, mdastToString } from '@project-r/styleguide'

// Used to check for relative urls
const FAKE_BASE_URL = `http://${uuid()}.local`

/**
 * Check if a URL is a private S3 signed URL
 * Private URLs contain AWS signature parameters like X-Amz-Signature
 */
const isPrivateAssetUrl = (url: string): boolean => {
  try {
    const urlObject = new URL(url)
    // AWS signed URLs contain these parameters
    return (
      urlObject.searchParams.has('X-Amz-Signature') ||
      urlObject.searchParams.has('X-Amz-Algorithm') ||
      urlObject.searchParams.has('X-Amz-Credential')
    )
  } catch {
    return false
  }
}

const useValidation = ({ meta, content, t, updateMailchimp }) => {
  const links = useMemo(() => {
    const toText = mdastToString
    const urlKey = 'url'
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
          // Check for private S3 signed URLs
          if (isPrivateAssetUrl(node[urlKey])) {
            warnings.push('privateAsset')
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

  // Check for private asset URLs in audio and other file fields
  const privateAssets = useMemo(() => {
    const assets: Array<{ url: string; location: string }> = []

    // Check audio source in metadata
    const audioSourceMp3 = meta?.audioSourceMp3 || content?.meta?.audioSourceMp3
    if (audioSourceMp3 && isPrivateAssetUrl(audioSourceMp3)) {
      assets.push({
        url: audioSourceMp3,
        location: t('publish/validation/privateAsset/audio'),
      })
    }

    return assets
  }, [content, meta, t])

  // Check if audio source exists but duration is missing
  const audioSourceMp3 = meta?.audioSourceMp3 || content?.meta?.audioSourceMp3
  const audioSourceDurationMs =
    meta?.audioSourceDurationMs || content?.meta?.audioSourceDurationMs
  const hasAudioWithoutDuration = !!audioSourceMp3 && !audioSourceDurationMs

  const errors = [
    meta.template !== 'front' &&
      !meta.slug &&
      t('publish/validation/slug/empty'),
    updateMailchimp &&
      !meta.emailSubject &&
      t('publish/validation/emailSubject/empty'),
    meta.template !== 'front' &&
      !content.meta.suppressSyntheticReadAloud &&
      !content.meta.syntheticVoice &&
      t('publish/validation/syntheticVoice/empty'),
    hasAudioWithoutDuration &&
      t('publish/validation/audioSourceDurationMs/missing'),
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
    // Add warnings for private asset URLs (files not yet made public)
    .concat(
      privateAssets.map((asset) =>
        t.elements('publish/validation/privateAsset/warning', {
          location: asset.location,
          link: (
            <Editorial.A
              key='link'
              href={asset.url}
              target='_blank'
              style={{ wordBreak: 'break-all' }}
            >
              {asset.url.length > 80
                ? asset.url.substring(0, 80) + '...'
                : asset.url}
            </Editorial.A>
          ),
        }),
      ),
    )

  return { errors, warnings, links }
}

export default useValidation
