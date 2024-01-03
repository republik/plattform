import { Button, HR, Interaction } from '@project-r/styleguide'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { GOTO_BASE_URL } from '../../lib/constants'
import { useInNativeApp } from '../../lib/withInNativeApp'
import Box from '../Frame/Box'

export const Blocker = ({ message, children }) => {
  const { asPath } = useRouter()
  const { inNativeApp } = useInNativeApp()

  const href = new URL(asPath, GOTO_BASE_URL).toString()

  if (inNativeApp) {
    return (
      <Box style={{ padding: 14, marginBottom: 20 }}>
        {message}
        {!!message && <HR />}
        <Button href={href} primary target='_blank'>
          Im Browser fortfahren
        </Button>
        <HR />
        <Interaction.P>href: {href}</Interaction.P>
      </Box>
    )
  }

  return children
}

Blocker.propTypes = {
  message: PropTypes.element,
  children: PropTypes.element.isRequired,
}

export default Blocker
