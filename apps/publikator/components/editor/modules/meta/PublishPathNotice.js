import { Label } from '@project-r/styleguide'
import { FRONTEND_BASE_URL } from '../../../../lib/settings'
import withT from '../../../../lib/withT'

const Notice = withT(({ t, previewPath, meta }) => {
  return (
    <Label>
      {t('metaData/field/slug/note', {
        base: FRONTEND_BASE_URL
          ? FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, '')
          : '',
        path: previewPath,
      })}
      <br />
      {!!meta.path && (
        <>
          {t('metaData/field/slug/pathNote', {
            base: FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, ''),
            path: meta.path,
          })}
          <br />
        </>
      )}
      <br />
    </Label>
  )
})

export default Notice
