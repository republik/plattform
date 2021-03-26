import React from 'react'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import MetaForm from '../../utils/MetaForm'
import {
  ShareImageGenerator,
  addSocialPrefix,
  SharePreviewFacebook,
  SharePreviewTwitter,
  Label
} from '@project-r/styleguide'
import { capitalize } from '../../../../lib/utils/format'

export const SOCIAL_MEDIA = ['facebook', 'twitter']
const SWITCH_KEY = 'showGenerator'

const previews = {
  facebook: SharePreviewFacebook,
  twitter: SharePreviewTwitter
}

const BaseForm = ({ withPrefix, data, onInputChange }) => {
  const initValues = Map([
    ['title', ''],
    ['description', ''],
    ['showGenerator', false]
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
      getWidth={() => '620px'}
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
  const showGenerator = data.get(withPrefix(SWITCH_KEY))
  const ImageHandler = showGenerator ? GenerateImage : UploadImage
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
