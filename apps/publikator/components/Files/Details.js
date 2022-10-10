import { Label } from '@project-r/styleguide'
import { css } from 'glamor'
import { displayDateTime } from '../../lib/utils/calendar'

const styles = {
  margin: css({
    marginLeft: '2rem',
  }),
}

export default ({ file }) => {
  const isReady = ['PUBLIC', 'PRIVATE'].includes(file.status)
  const isPublic = file.status === 'PUBLIC'

  return (
    <div {...styles.margin}>
      <Label>
        {displayDateTime(file.createdAt)}
        {' · '}
        {file.author?.name}
        {isReady && !isPublic && (
          <>
            {' · '}
            nicht öffentlich
          </>
        )}
      </Label>
    </div>
  )
}
