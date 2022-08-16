import { Fragment } from 'react'
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
  Field,
} from '@project-r/styleguide'
import ImageInput from '../../editor/utils/ImageInput'
import withT from '../../../lib/withT'
import { MetaOption, MetaOptionLabel, AutosizeInput } from './Layout'

export const SOCIAL_MEDIA = ['facebook', 'twitter']

const ShareImageForm = withT(({ t, data, onChange }) => {
  return (
    <>
      <MetaOption>
        <MetaOptionLabel>ShareTafel</MetaOptionLabel>
        <ShareImageGenerator
          fontSize={data.shareFontSize || 60}
          onFontSizeChange={(e, value) =>
            onChange('shareFontSize', Number(value) || '')
          }
          onFontSizeInc={(e, value) =>
            onChange('shareFontSize', (data.shareFontSize || 56) + 1)
          }
          onFontSizeDec={(e, value) =>
            onChange('shareFontSize', (data.shareFontSize || 56) - 1)
          }
          inverted={data.shareInverted}
          onInvertedChange={(e, value) =>
            onChange('shareInverted', !data.shareInverted)
          }
          text={data.shareText}
          onTextChange={(e) => onChange('shareText', e.target.value)}
          format={'editorial'}
        />
        <ShareImagePreview
          fontSize={data.shareFontSize || 60}
          inverted={data.shareInverted}
          text={data.shareText}
          format={'editorial'}
          preview
        />
      </MetaOption>
      <MetaOption>
        <MetaOptionLabel>Twitter</MetaOptionLabel>
        <Field
          label='Twitter Titel'
          name='twitterTitle'
          value={data.twitterTitle || data.title}
          onChange={(event) => {
            onChange(event.target.name, event.target.value)
          }}
          noMargin
          renderInput={({ ref, ...inputProps }) => (
            <AutosizeInput {...inputProps} ref={ref} />
          )}
        />
      </MetaOption>
      <MetaOption>
        <Field
          label='Twitter Beschrieb'
          name='twitterDescription'
          value={data.twitterDescription || data.description}
          onChange={(event) => {
            onChange(event.target.name, event.target.value)
          }}
          noMargin
          renderInput={({ ref, ...inputProps }) => (
            <AutosizeInput {...inputProps} ref={ref} />
          )}
        />
      </MetaOption>
      <MetaOption>
        <SharePreviewTwitter
          title={data.twitterTitle || data.title}
          description={data.twitterDescription || data.lead}
        />
      </MetaOption>
      <MetaOption>
        <MetaOptionLabel>Twitter</MetaOptionLabel>
        <Field
          label='Facebook Titel'
          name='facebookTitle'
          value={data.facebookTitle || data.title}
          onChange={(event) => {
            onChange(event.target.name, event.target.value)
          }}
          noMargin
          renderInput={({ ref, ...inputProps }) => (
            <AutosizeInput {...inputProps} ref={ref} />
          )}
        />
      </MetaOption>
      <MetaOption>
        <Field
          label='Facebook Beschrieb'
          name='facebookDescription'
          value={data.facebookDescription || data.description}
          onChange={(event) => {
            onChange(event.target.name, event.target.value)
          }}
          noMargin
          renderInput={({ ref, ...inputProps }) => (
            <AutosizeInput {...inputProps} ref={ref} />
          )}
        />
      </MetaOption>
      <MetaOption>
        <SharePreviewFacebook
          title={data.facebookTitle || data.title}
          description={data.facebookDescription || data.lead}
        />
      </MetaOption>
    </>
  )
})

export default withT(ShareImageForm)
