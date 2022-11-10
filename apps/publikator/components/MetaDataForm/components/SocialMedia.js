import {
  ShareImageGenerator,
  ShareImagePreview,
  SharePreviewFacebook,
  SharePreviewTwitter,
  Field,
  Checkbox,
} from '@project-r/styleguide'
import { MetaOption, MetaOptionLabel, AutosizeInput } from './Layout'
import { FLYER_FORMAT } from '../index'

export const SOCIAL_MEDIA = ['facebook', 'twitter']

const ShareImageForm = ({ data, onChange, syncKeys, sync, unsync }) => {
  return (
    <>
      <MetaOption>
        <MetaOptionLabel>Share Text von Begrüssung übernehmen</MetaOptionLabel>
        <Checkbox
          checked={syncKeys.includes('shareText')}
          onChange={(_, checked) => {
            if (checked) {
              sync('shareText')
            } else {
              unsync('shareText')
            }
          }}
        >
          übernehmen
        </Checkbox>
      </MetaOption>
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
          onTextChange={(e) => {
            onChange('shareText', e.target.value)
            unsync('shareText')
          }}
          format={FLYER_FORMAT.meta}
        />
        <ShareImagePreview
          fontSize={data.shareFontSize || 60}
          inverted={data.shareInverted}
          text={data.shareText}
          format={FLYER_FORMAT.meta}
          preview
        />
      </MetaOption>
      <MetaOption>
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
        <MetaOptionLabel>Twitter Vorschau</MetaOptionLabel>
        <SharePreviewTwitter
          title={data.twitterTitle || data.title}
          description={data.twitterDescription || data.description}
        />
      </MetaOption>
      <MetaOption>
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
        <MetaOptionLabel>Facebook Vorschau</MetaOptionLabel>
        <SharePreviewFacebook
          title={data.facebookTitle || data.title}
          description={data.facebookDescription || data.description}
        />
      </MetaOption>
    </>
  )
}

export default ShareImageForm
