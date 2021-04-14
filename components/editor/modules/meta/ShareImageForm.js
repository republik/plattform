import React, { Fragment, useEffect, useState } from 'react'
import { Map } from 'immutable'
import MetaForm from '../../utils/MetaForm'
import {
  ShareImageGenerator,
  ShareImagePreview,
  SharePreviewFacebook,
  SharePreviewTwitter,
  socialPreviewStyles,
  Label,
  SHARE_IMAGE_DEFAULTS
} from '@project-r/styleguide'
import ImageInput from '../../utils/ImageInput'
import withT from '../../../../lib/withT'

export const SOCIAL_MEDIA = ['facebook', 'twitter']

const previews = {
  facebook: SharePreviewFacebook,
  twitter: SharePreviewTwitter
}

const BaseForm = ({ socialKey, data, onInputChange }) => {
  const initValues = Map([
    [socialKey + 'Title', ''],
    [socialKey + 'Description', '']
  ])
  const initData = initValues.merge(
    data.filter((_, key) => initValues.has(key))
  )
  return <MetaForm data={initData} onInputChange={onInputChange} />
}

const UploadImage = withT(({ t, data, onInputChange, socialKey }) => {
  const imageKey = socialKey + 'Image'
  const labelHeight = 17 + 5

  return (
    <div style={{ height: 314 + labelHeight, width: 600, overflow: 'hidden' }}>
      <ImageInput
        maxWidth='100%'
        maxHeight={314}
        imageStyles={socialPreviewStyles[socialKey]}
        label={t(`metaData/field/${imageKey}`)}
        src={data.get(imageKey)}
        onChange={onInputChange(imageKey)}
      />
    </div>
  )
})

const GenerateImage = ({ data, onInputChange, format }) => (
  <ShareImageGenerator
    format={format}
    fontSize={data.get('shareFontSize')}
    onFontSizeChange={(e, value) =>
      onInputChange('shareFontSize')(undefined, Number(value) || undefined)
    }
    onFontSizeInc={() =>
      onInputChange('shareFontSize')(
        undefined,
        (data.get('shareFontSize') || 60) + 1
      )
    }
    onFontSizeDec={() =>
      onInputChange('shareFontSize')(
        undefined,
        Math.max(data.get('shareFontSize') - 1, 0)
      )
    }
    inverted={data.get('shareInverted')}
    onInvertedChange={onInputChange('shareInverted')}
    text={data.get('shareText')}
    onTextChange={e => onInputChange('shareText')(undefined, e.target.value)}
    textPosition={data.get('shareTextPosition')}
    onTextPositionChange={item =>
      onInputChange('shareTextPosition')(undefined, item.value)
    }
  />
)

const PreviewText = ({ data, socialKey }) => {
  const Preview = previews[socialKey]
  return (
    <Preview
      title={data.get(socialKey + 'Title') || data.get('title')}
      descrition={
        data.get(socialKey + 'Description') || data.get('description')
      }
    />
  )
}

const ShareImageForm = ({ onInputChange, format, data }) => {
  const [generated, setGenerated] = useState(true)

  useEffect(() => {
    if (generated) {
      data.set('shareInverted', false)
      data.set('shareTextPosition', SHARE_IMAGE_DEFAULTS.textPosition)
      data.set('shareFontSize', SHARE_IMAGE_DEFAULTS.fontSize)
      data.set('shareText', '')
    } else {
      data.remove('shareInverted')
      data.remove('shareTextPosition')
      data.remove('shareFontSize')
      data.remove('shareText')
    }
  }, [generated])

  return (
    <div>
      <Label>Sharebild Metadaten</Label>
      <div>SWITCH</div>
      <br />

      {SOCIAL_MEDIA.map(socialKey => (
        <Fragment key={socialKey}>
          <BaseForm
            socialKey={socialKey}
            data={data}
            onInputChange={onInputChange}
          />
          <br />
          {!generated && (
            <>
              <UploadImage
                socialKey={socialKey}
                data={data}
                onInputChange={onInputChange}
              />
              <PreviewText data={data} socialKey={socialKey} />
            </>
          )}
        </Fragment>
      ))}

      {generated && (
        <>
          <GenerateImage
            format={format}
            data={data}
            onInputChange={onInputChange}
          />
          {SOCIAL_MEDIA.map(socialKey => (
            <Fragment key={socialKey}>
              <ShareImagePreview
                fontSize={data.get('shareFontSize')}
                inverted={data.get('shareInverted')}
                text={data.get('shareText')}
                textPosition={data.get('shareTextPosition')}
                format={format}
                preview={socialKey}
              />
              <PreviewText data={data} socialKey={socialKey} />
            </Fragment>
          ))}
        </>
      )}
    </div>
  )
}

export default ShareImageForm
