import { Fragment, useEffect, useState } from 'react'
import { Map } from 'immutable'
import MetaForm from '../../utils/MetaForm'
import {
  ShareImageGenerator,
  ShareImagePreview,
  SharePreviewFacebook,
  SharePreviewTwitter,
  socialPreviewStyles,
  socialPreviewWidth,
  Label,
  SHARE_IMAGE_DEFAULTS,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  Radio,
} from '@project-r/styleguide'
import ImageInput from '../../utils/ImageInput'
import withT from '../../../../lib/withT'
import {
  MetaOptionGroup,
  MetaOptionGroupTitle,
} from '../../../MetaDataForm/components/Layout'

export const SOCIAL_MEDIA = ['facebook', 'twitter']

const imageHeightRatio = SHARE_IMAGE_HEIGHT / SHARE_IMAGE_WIDTH

const previews = {
  facebook: SharePreviewFacebook,
  twitter: SharePreviewTwitter,
}

const BaseForm = ({ socialKey, data, onInputChange, repoId }) => {
  const initValues = Map([
    [socialKey + 'Title', ''],
    [socialKey + 'Description', ''],
  ])
  const initData = initValues.merge(
    data.filter((_, key) => initValues.has(key)),
  )
  return (
    <MetaForm
      data={initData}
      onInputChange={onInputChange}
      getWidth={() => 620}
      repoId={repoId}
    />
  )
}

const UploadImage = withT(({ t, data, onInputChange, socialKey, repoId }) => {
  const imageKey = socialKey + 'Image'
  const labelHeight = 17 + 5

  const width = socialPreviewWidth[socialKey] || 600
  const height = width * imageHeightRatio

  return (
    <div style={{ height: height + labelHeight, width, overflow: 'hidden' }}>
      <ImageInput
        width={width}
        height={height}
        maxWidth='none'
        imageStyles={socialPreviewStyles[socialKey]}
        label={t(`metaData/field/${imageKey}`)}
        src={data.get(imageKey)}
        placeholder={
          !data.get('image') ? '/static/teilen.png' : data.get('image')
        }
        onChange={onInputChange(imageKey)}
        repoId={repoId}
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
        (data.get('shareFontSize') || 60) + 1,
      )
    }
    onFontSizeDec={() =>
      onInputChange('shareFontSize')(
        undefined,
        Math.max(data.get('shareFontSize') - 1, 0),
      )
    }
    inverted={data.get('shareInverted')}
    onInvertedChange={onInputChange('shareInverted')}
    text={data.get('shareText')}
    onTextChange={(e) => onInputChange('shareText')(undefined, e.target.value)}
    textPosition={data.get('shareTextPosition')}
    onTextPositionChange={(item) =>
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

const ShareImageForm = withT(({ t, editor, node, onInputChange, format, repoId }) => {
  const generated = !!(
    node.data.get('shareText') ||
    node.data.get('shareFontSize') ||
    node.data.get('shareTextPosition')
  )

  const setGenerated = (generated) => {
    if (generated) {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data
            .set(
              'shareTextPosition',
              node.data.get('shareTextPosition') ||
                SHARE_IMAGE_DEFAULTS.textPosition,
            )
            .set(
              'shareFontSize',
              node.data.get('shareFontSize') || SHARE_IMAGE_DEFAULTS.fontSize,
            ),
        })
      })
    } else {
      editor.change((change) => {
        change.setNodeByKey(node.key, {
          data: node.data
            .remove('shareInverted')
            .remove('shareTextPosition')
            .remove('shareFontSize')
            .remove('shareText'),
        })
      })
    }
  }

  const data = node.data

  return (
    <div>
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
      {SOCIAL_MEDIA.map((socialKey) => (
        <Fragment key={socialKey}>
          <MetaOptionGroupTitle>{socialKey}</MetaOptionGroupTitle>
          <MetaOptionGroup>
            <BaseForm
              socialKey={socialKey}
              data={data}
              onInputChange={onInputChange}
              repoId={repoId}
            />
            {generated ? (
              <>
                <Label>
                  {t(`metaData/field/${socialKey}Preview`)}
                  {/* linebreak necessary because shareimage applies additional error label below */}
                  <br />
                </Label>
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
                repoId={repoId}
              />
            )}
            <PreviewText data={data} socialKey={socialKey} />
            <div style={{ marginTop: 5 }}>
              <Label>{t(`metaData/field/${socialKey}Preview/note`)}</Label>
            </div>
          </MetaOptionGroup>
        </Fragment>
      ))}
    </div>
  )
})

export default withT(ShareImageForm)
