import { useEffect } from 'react'
import { css, merge } from 'glamor'
import Dropzone from 'react-dropzone'

import withT from '../../../lib/withT'

import { useColorContext } from '@project-r/styleguide'
import { IconClose } from '@republik/icons'

const styles = {
  img: css({
    display: 'block',
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
  preview: css({
    filter: 'grayscale(1)',
  }),
  dropzone: css({
    position: 'relative',
    width: '100%',
    height: '100%',
  }),
  note: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '5px 10px',
    color: '#fff',
  }),
  remove: css({
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
  }),
}

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new window.FileReader()
    fileReader.addEventListener('load', (event) => {
      const url = event.target.result

      // Strip out the information about the mime type of the file and the encoding
      // at the beginning of the file (e.g. data:image/gif;base64,).
      const content = url.replace(/^(.+,)/, '')

      resolve({
        filename: file.name,
        url,
        content,
      })
    })

    fileReader.addEventListener('error', (error) => {
      reject(error)
    })

    fileReader.readAsDataURL(file)
  });
}

const PortraitSelector = withT(
  ({
    t,
    user,
    isEditing,
    isMandadory,
    styles: propStyles = {},
    isMe,
    values,
    errors,
    onChange,
  }) => {
    useEffect(() => {
      if (isMandadory && !values.portrait && !user.portrait) {
        onChange({
          errors: {
            portrait: t('profile/portrait/empty'),
          },
        })
      }
    }, [isMandadory])

    const [colorScheme] = useColorContext()

    const preview = isEditing && values.portraitPreview
    const imgUrl =
      values.portrait !== undefined ? values.portraitPreview : user.portrait
    const img = (
      <span
        {...styles.img}
        {...colorScheme.set('backgroundColor', 'hover')}
        {...(preview && merge(styles.preview, propStyles.preview))}
        style={{
          backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
        }}
      />
    )

    const disabled = !isMe || !isEditing
    const note = (() => {
      if (disabled) {
        return
      }
      if (errors?.portrait && errors.portrait !== t('profile/portrait/empty')) {
        return errors.portrait
      }
      if (
        values.portrait === undefined ? !user.portrait : !values.portraitPreview
      ) {
        return t('profile/portrait/choose')
      }
      if (user.portrait || values.portraitPreview) {
        return t('profile/portrait/update')
      }
      return false
    })()

    return (
      <Dropzone
        disablePreview
        disabled={disabled}
        className={styles.dropzone.toString()}
        style={{
          cursor: isEditing ? 'pointer' : 'auto',
        }}
        accept='image/jpeg, image/png, image/gif'
        onDrop={(accepted, rejected) => {
          if (accepted.length) {
            const file = accepted[0]
            if (file.size && file.size > 6.5 * 1024 * 1024) {
              onChange({
                errors: {
                  portrait: t('profile/portrait/tooBig'),
                },
              })
              return
            }
            readFile(file)
              .then(({ content, url }) => {
                onChange({
                  values: {
                    portrait: content,
                    portraitPreview: url,
                  },
                  errors: {
                    portrait: undefined,
                  },
                })
              })
              .catch(() => {
                onChange({
                  errors: {
                    portrait: t('profile/portrait/readError'),
                  },
                })
              })
          } else if (rejected.length) {
            onChange({
              errors: {
                portrait: t('profile/portrait/invalidType'),
              },
            })
          }
        }}
      >
        {isEditing && imgUrl && (
          <div
            {...styles.remove}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange({
                values: {
                  portrait: null,
                  portraitPreview: undefined,
                },
                errors: {
                  portrait: isMandadory
                    ? t('profile/portrait/empty')
                    : undefined,
                },
              })
            }}
          >
            <IconClose size={16} style={{ display: 'block' }} />
          </div>
        )}
        {img}
        {note && <div {...styles.note}>{note}</div>}
      </Dropzone>
    )
  },
)

export default PortraitSelector
