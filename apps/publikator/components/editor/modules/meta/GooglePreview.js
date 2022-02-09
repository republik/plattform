import React from 'react'
import { Label } from '@project-r/styleguide'
import { timeFormat } from 'd3-time-format'

import { FRONTEND_BASE_URL } from '../../../../lib/settings'
import withT from '../../../../lib/withT'

const urlSeparator = ' › '

const formatDate = timeFormat('%d.%m.%Y')

function wordTrim(text, length) {
  if (text.length > length) {
    return text.slice(0, length).split(' ').slice(0, -1).join(' ') + ' ...'
  }
  return text
}

const GooglePreview = ({
  title = '',
  description = '',
  path = '',
  publishDate,
  t,
}) => {
  let pathSegments = path.split('/').filter(Boolean)

  const hasDateSegement = path.match(/^\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\//)
  if (hasDateSegement) {
    pathSegments = [
      pathSegments.slice(0, 3).join('/'),
      ...pathSegments.slice(3),
    ]
  }
  let remainingPathChars = 25
  pathSegments = pathSegments
    .map((segment) => {
      if (remainingPathChars <= 0) {
        return
      }
      let visible = segment
      if (segment.length > remainingPathChars) {
        visible = segment.slice(0, remainingPathChars) + '...'
        remainingPathChars = 0
      } else {
        remainingPathChars -= segment.length
      }
      return visible
    })
    .filter(Boolean)

  return (
    <>
      <Label>{t('metaData/field/googlePreview')}</Label>
      <div
        style={{
          maxWidth: 600 + 20,
          fontFamily: 'arial, sans-serif',
          fontSize: 14,
          lineHeight: 1.58,
          color: '#5f6368',
          backgroundColor: '#fff',
          padding: 10,
        }}
      >
        <a style={{ margin: 0, lineHeight: 1.3 }}>
          <span style={{ color: '#202124' }}>{FRONTEND_BASE_URL}</span>
          {urlSeparator}
          {pathSegments.join(urlSeparator)}
        </a>
        <h3
          style={{
            margin: 0,
            marginBottom: 3,
            paddingTop: 4,
            fontSize: 20,
            fontWeight: 'normal',
            lineHeight: 1.3,
            color: 'rgb(26, 13, 171)',
          }}
        >
          {wordTrim(title, 65)}
        </h3>
        <p style={{ margin: 0, color: '#4d5156' }}>
          {publishDate && (
            <span style={{ color: '#70757a' }}>
              {formatDate(publishDate)}
              {' — '}
            </span>
          )}
          {wordTrim(description, publishDate ? 140 : 160)}
        </p>
      </div>
      <div style={{ marginTop: 5 }}>
        <Label>{t('metaData/field/googlePreview/note')}</Label>
      </div>
    </>
  )
}

export default withT(GooglePreview)
