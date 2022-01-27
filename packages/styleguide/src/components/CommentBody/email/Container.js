import React from 'react'

import { serifRegular16 } from '../../Typography/styles'

// em and strong css is injected into email html head in the backend template
// https://github.com/orbiting/backends/commit/ff8b6b35927f6a3402baec7f293ec7cdb25a90d8

export default ({ children }) => <div style={serifRegular16}>{children}</div>
