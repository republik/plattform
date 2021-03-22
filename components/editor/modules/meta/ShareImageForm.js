import React from 'react'
import withT from '../../../../lib/withT'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import MetaForm from '../../utils/MetaForm'
import { getWidth } from './ui'
import {
  ShareImageGenerator,
  addSocialPrefix,
  SharePreviewFacebook,
  SharePreviewTwitter
} from '@project-r/styleguide'

export const SOCIAL_MEDIA = ['facebook', 'twitter']
const SWITCH_KEY = 'showUploader'

const previews = {
  facebook: SharePreviewFacebook,
  twitter: SharePreviewTwitter
}

const BaseForm = ({ withPrefix, data, onInputChange, format }) => {
  const initValues = Map([
    ['title', ''],
    ['description', ''],
    ['showUploader', !format]
  ])
  const prefixedValues = initValues.mapKeys(withPrefix)
  const initData = prefixedValues.merge(
    data.filter((_, key) => prefixedValues.has(key))
  )
  return <MetaForm data={initData} onInputChange={onInputChange} />
}

const UploadImage = ({ withPrefix, data, onInputChange }) => {
  const initValues = Map([[withPrefix('image'), '']])
  const initData = initValues.merge(
    data.filter((_, key) => initValues.has(key))
  )
  return (
    <MetaForm
      data={initData}
      onInputChange={onInputChange}
      getWidth={getWidth}
    />
  )
}

const GenerateImage = ({
  withPrefix,
  data,
  onInputChange,
  socialKey,
  format
}) => {
  const initValues = Map([
    ['coloredBackground', false],
    ['backgroundImage', true],
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

const ShareImageForm = withT(
  ({ t, onInputChange, socialKey, format, data }) => {
    const withPrefix = addSocialPrefix(socialKey)
    const showUploader = data.get(withPrefix(SWITCH_KEY))
    const ImageHandler = showUploader ? UploadImage : GenerateImage
    const Preview = previews[socialKey]

    return (
      <>
        <BaseForm
          withPrefix={withPrefix}
          data={data}
          onInputChange={onInputChange}
          format={format}
        />
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
      </>
    )
  }
)

ShareImageForm.propTypes = {
  socialKey: PropTypes.oneOf(SOCIAL_MEDIA).isRequired
}

export default ShareImageForm
