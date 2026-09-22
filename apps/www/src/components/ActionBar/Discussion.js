import withT from '@/lib/withT'
import { IconButton } from '@project-r/styleguide'
import { IconEtiquette, IconFontSize } from '@republik/icons'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { useState } from 'react'
import FontSizeOverlay from '../FontSize/Overlay'

const DiscussionActionBar = ({ t }) => {
  const [fontSizeOverlayVisible, setFontSizeOverlayVisible] = useState(false)

  return (
    <div {...styles.topRow}>
      <IconButton
        Icon={IconEtiquette}
        label={t('components/Discussion/etiquette')}
        labelShort={t('components/Discussion/etiquette')}
        href='/etikette'
      />
      <IconButton
        Icon={IconFontSize}
        onClick={(e) => {
          e.preventDefault()
          setFontSizeOverlayVisible(!fontSizeOverlayVisible)
        }}
      />
      {fontSizeOverlayVisible && (
        <FontSizeOverlay onClose={() => setFontSizeOverlayVisible(false)} />
      )}
    </div>
  )
}

const styles = {
  topRow: css({
    display: 'flex',
  }),
}

export default compose(withT)(DiscussionActionBar)
