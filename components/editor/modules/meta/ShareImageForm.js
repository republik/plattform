import React from 'react'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import MetaForm from '../../utils/MetaForm'
import {
  ShareImageGenerator,
  addSocialPrefix,
  SharePreviewFacebook,
  SharePreviewTwitter,
  socialPreviewStyles,
  Label
} from '@project-r/styleguide'
import { capitalize } from '../../../../lib/utils/format'
import ImageInput from '../../utils/ImageInput'
import withT from '../../../../lib/withT'

export const SOCIAL_MEDIA = ['facebook', 'twitter']
const SWITCH_KEY = 'generated'

const previews = {
  facebook: SharePreviewFacebook,
  twitter: SharePreviewTwitter
}

const BaseForm = ({ withPrefix, data, onInputChange }) => {
  const initValues = Map([
    ['title', ''],
    ['description', ''],
    ['generated', false]
  ])
  const prefixedValues = initValues.mapKeys(withPrefix)
  const initData = prefixedValues.merge(
    data.filter((_, key) => prefixedValues.has(key))
  )
  return <MetaForm data={initData} onInputChange={onInputChange} />
}

const UploadImage = withT(
  ({ t, withPrefix, data, onInputChange, socialKey }) => {
    const imageKey = withPrefix('image')
    const labelHeight = 17 + 5

    return (
      <div
        style={{ height: 314 + labelHeight, width: 600, overflow: 'hidden' }}
      >
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
  }
)

const GenerateImage = ({
  withPrefix,
  data,
  onInputChange,
  socialKey,
  format
}) => {
  const initValues = Map([
    ['coloredBackground', false],
    ['illuBackground', false],
    ['textPosition', 'bottom'],
    ['fontSize', 60],
    ['fontStyle', 'serifBold'],
    ['text', '']
  ])
  const prefixedValues = initValues.mapKeys(withPrefix)
  const initData = prefixedValues.merge(
    data.filter((_, key) => prefixedValues.has(key))
  )
  return (
    <ShareImageGenerator
      format={format}
      data={initData}
      onInputChange={onInputChange}
      socialKey={socialKey}
      embedPreview
    />
  )
}

const ShareImageForm = ({ onInputChange, socialKey, format, data }) => {
  const withPrefix = addSocialPrefix(socialKey)
  const generated = data.get(withPrefix(SWITCH_KEY))
  const ImageHandler = generated ? GenerateImage : UploadImage
  const Preview = previews[socialKey]
  return (
    <div>
      <Label>{capitalize(socialKey)} Metadaten</Label>
      <BaseForm
        withPrefix={withPrefix}
        data={data}
        onInputChange={onInputChange}
      />
      <br />
      <ImageHandler
        format={format}
        withPrefix={withPrefix}
        socialKey={socialKey}
        data={data}
        onInputChange={onInputChange}
      />
      <Preview
        title={data.get(withPrefix('title')) || data.get('title')}
        descrition={
          data.get(withPrefix('description')) || data.get('description')
        }
      />
    </div>
  )
}

ShareImageForm.propTypes = {
  socialKey: PropTypes.oneOf(SOCIAL_MEDIA).isRequired
}

export default ShareImageForm
