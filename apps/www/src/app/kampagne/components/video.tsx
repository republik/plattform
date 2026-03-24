import { css } from '@republik/theme/css'

export function Video() {
  return (
    <video
      src='https://cdn.repub.ch/s3/republik-assets/repos/republik/article-republik-versus-amazon-2-0/files/d880f823-6b30-48d0-8f56-289684d1c76f/wir_suchen_2000_neue_mitglieder-(1080p).mp4'
      poster='https://cdn.repub.ch/s3/republik-assets/repos/republik/article-republik-versus-amazon-2-0/files/10e17214-9910-4703-99c0-860c4e6cb333/thumb.jpg'
      controls
      playsInline
      preload='metadata'
      className={css({ aspectRatio: '9/16', width: '100%' })}
    />
  )
}
