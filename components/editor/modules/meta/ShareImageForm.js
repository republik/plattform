import React from 'react'
import { css } from 'glamor'

import withT from '../../../../lib/withT'
import { Map, Set } from 'immutable'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'
import PropTypes from 'prop-types'
import MetaForm from '../../utils/MetaForm'
import { getWidth } from './ui'
import { ShareImageGenerator } from '@project-r/styleguide'

const styles = {
  title: css({
    display: 'block',
    marginBottom: 5
  }),
  container: css({
    backgroundColor: '#fff',
    padding: '5px 10px 15px',
    marginBottom: 15
  }),
  close: css({
    float: 'right'
  }),
  add: css({
    marginTop: 10,
    fontSize: 14
  }),
  help: css({
    margin: '0 0 10px'
  })
}

// 'format' and 'backgroundImage' come from other data

const SUPPORTED_MEDIA = ['facebook', 'twitter']
const SWITCH_KEY = 'showUploader'

const previews = {
  facebook: FBPreview,
  twitter: TwitterPreview
}

const formKeys = Set([
  'text',
  'fontSize',
  'coloredBackground', // bool
  'backgroundImage', // bool only if column
  'textPosition', // only if column
  'customFontSize' // only if no format
  // format
  //
])

const capitalise = word => word.replace(/^\w/, c => c.toUpperCase())
const addMediumPrefix = mediumKey => key => mediumKey + capitalise(key)
const processKeys = (keys, mediumKey) =>
  Set(keys.map(addMediumPrefix(mediumKey)))

const BaseForm = ({ mediumKey, data, onInputChange }) => {
  const baseKeys = processKeys(
    ['title', 'description', 'showUploader'],
    mediumKey
  )
  const baseDefaultValues = Map(
    baseKeys.map(key => [key, key === addMediumPrefix(SWITCH_KEY) ? false : ''])
  )
  const baseData = baseDefaultValues.merge(
    data.filter((_, key) => baseKeys.has(key))
  )
  return <MetaForm data={baseData} onInputChange={onInputChange} />
}

const UploadImage = ({ mediumKey, data, onInputChange, Preview }) => {
  const imageKeys = processKeys(['image'], mediumKey)
  const imageDefaultValues = Map(imageKeys.map(key => [key, '']))
  const imageData = imageDefaultValues.merge(
    data.filter((_, key) => imageKeys.has(key))
  )
  return (
    <>
      <MetaForm
        data={imageData}
        onInputChange={onInputChange}
        getWidth={getWidth}
      />
      <Preview data={data} />
    </>
  )
}

const GenerateImage = ({ mediumKey, data, onInputChange, Preview, format }) => (
  <>
    <ShareImageGenerator format={format} />
    <Preview data={data} />
  </>
)

const ShareImageForm = withT(
  ({ t, onInputChange, mediumKey, format, data }) => {
    const showUploader = data.get(addMediumPrefix(mediumKey)(SWITCH_KEY))
    const ImageHandler = showUploader ? UploadImage : GenerateImage
    const Preview = previews[mediumKey]

    return (
      <>
        <BaseForm
          mediumKey={mediumKey}
          data={data}
          onInputChange={onInputChange}
        />
        <ImageHandler
          format={format}
          mediumKey={mediumKey}
          data={data}
          onInputChange={onInputChange}
          Preview={Preview}
        />
      </>
    )
  }
)

ShareImageForm.propTypes = {
  mediumKey: PropTypes.oneOf(SUPPORTED_MEDIA).isRequired
}

export default ShareImageForm
