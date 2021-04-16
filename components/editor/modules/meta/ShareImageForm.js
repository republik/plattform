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
  SHARE_IMAGE_DEFAULTS,
  Radio
} from '@project-r/styleguide'
import ImageInput from '../../utils/ImageInput'
import withT from '../../../../lib/withT'
import { capitalize } from '../../../../lib/utils/format'

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
  return (
    <MetaForm
      data={initData}
      onInputChange={onInputChange}
      getWidth={() => 620}
    />
  )
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
      description={
        data.get(socialKey + 'Description') || data.get('description')
      }
    />
  )
}

const ShareImageForm = withT(({ t, onInputChange, format, data }) => {
  const [generated, setGenerated] = useState(
    !!format || !!data.get('shareText')
  )

  useEffect(() => {
    if (generated) {
      !data.get('shareTextPosition') &&
        onInputChange('shareTextPosition')(
          undefined,
          SHARE_IMAGE_DEFAULTS.textPosition
        )
      !data.get('shareFontSize') &&
        onInputChange('shareFontSize')(undefined, SHARE_IMAGE_DEFAULTS.fontSize)
    } else {
      onInputChange('shareInverted')(undefined, undefined)
      onInputChange('shareTextPosition')(undefined, undefined)
      onInputChange('shareFontSize')(undefined, undefined)
      onInputChange('shareText')(undefined, undefined)
    }
  }, [generated])

  return (
    <div>
      <Label style={{ display: 'block', paddingBottom: 5 }}>Social Media</Label>
      <div>
        <Radio
          checked={!generated}
          onChange={() => setGenerated(false)}
          style={{ marginRight: 30 }}
        >
          Bilder hochladen
        </Radio>
        <Radio checked={generated} onChange={() => setGenerated(true)}>
          Tafel bauen
        </Radio>
      </div>
      {generated && (
        <>
          <br />
          <GenerateImage
            format={format}
            data={data}
            onInputChange={onInputChange}
          />
        </>
      )}
      {SOCIAL_MEDIA.map(socialKey => (
        <Fragment key={socialKey}>
          <BaseForm
            socialKey={socialKey}
            data={data}
            onInputChange={onInputChange}
          />
          {generated ? (
            <>
              <Label>{t(`metaData/field/${socialKey}Preview`)}</Label>
              <ShareImagePreview
                fontSize={data.get('shareFontSize')}
                inverted={data.get('shareInverted')}
                text={data.get('shareText')}
                textPosition={data.get('shareTextPosition')}
                format={format}
                preview={socialKey}
              />
            </>
          ) : (
            <UploadImage
              socialKey={socialKey}
              data={data}
              onInputChange={onInputChange}
            />
          )}
          <PreviewText data={data} socialKey={socialKey} />
          <br />
        </Fragment>
      ))}
    </div>
  )
})

export default ShareImageForm
