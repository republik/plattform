import { css } from 'glamor'
import { useMemo } from 'react'
import { plainButtonRule, useColorContext } from '@project-r/styleguide'

const PlainButton = (props) => {
  const [colorScheme] = useColorContext()
  const colorRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('primary'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )
  return <button {...plainButtonRule} {...colorRule} {...props} />
}

export default PlainButton
