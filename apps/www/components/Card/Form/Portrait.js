import { css } from 'glamor'

import ProfilePortrait from '../../Profile/Portrait'

const Portrait = (props) => (
  <ProfilePortrait
    isEditing
    isMe
    styles={{ preview: css({ filter: '' }) }}
    {...props}
  />
)

export default Portrait
