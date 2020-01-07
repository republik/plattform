import React from 'react'
import { Checkbox } from '@project-r/styleguide'
import withT from '../../../../lib/withT'

export const DARK_MODE_KEY = 'darkMode'

export default withT(({ t, data, onChange }) => {
  return (
    <div style={{ marginTop: 10 }}>
      <Checkbox checked={data.get(DARK_MODE_KEY)} onChange={onChange}>
        Dark mode
      </Checkbox>
    </div>
  )
})
