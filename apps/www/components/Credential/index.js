import { css } from 'glamor'
import { CheckIcon } from '@project-r/styleguide'
import { useColorContext } from '@project-r/styleguide'

import withT from '../../lib/withT'

const styles = {
  check: css({
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2,
  }),
}

const Credential = ({ description, verified, t, textColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      title={
        (verified &&
          t('styleguide/comment/header/verifiedCredential', undefined, '')) ||
        undefined
      }
      {...(textColor &&
        colorScheme.set('color', verified ? 'text' : 'textSoft'))}
    >
      {description}
      {verified && (
        <CheckIcon
          {...styles.check}
          {...(textColor && colorScheme.set('fill', 'primary'))}
        />
      )}
    </span>
  )
}

export default withT(Credential)
