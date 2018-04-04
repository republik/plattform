import React from 'react'
import {
  Checkbox,
  Interaction
} from '@project-r/styleguide'

import withMe from '../../../lib/withMe'

const RolesForm = ({ me, user, onAdd, onRemove }) => {
  if (me && me.roles.indexOf('admin') < 0) {
    return null
  }
  return (
    <div>
      <Interaction.H3>Rollen</Interaction.H3>
      <p>
        <Checkbox
          checked={user.roles.indexOf('editor') > -1}
          onChange={(_, checked) =>
            (checked && onAdd({ role: 'editor' })) ||
            onRemove({ role: 'editor' })
          }
        >
          Editor
        </Checkbox>
      </p>
      <p>
        <Checkbox
          checked={user.roles.indexOf('supporter') > -1}
          onChange={(_, checked) =>
            (checked && onAdd({ role: 'supporter' })) ||
            onRemove({ role: 'supporter' })
          }
        >
          Supporter
        </Checkbox>
      </p>
      <p>
        <Checkbox
          checked={user.roles.indexOf('accountant') > -1}
          onChange={(_, checked) =>
            (checked && onAdd({ role: 'accountant' })) ||
            onRemove({ role: 'accountant' })
          }
        >
          Accountant
        </Checkbox>
      </p>
      <p>
        <Checkbox
          checked={user.roles.indexOf('admin') > -1}
          onChange={(_, checked) =>
            (checked && onAdd({ role: 'admin' })) ||
            onRemove({ role: 'admin' })
          }
        >
          Admin
        </Checkbox>
      </p>
    </div>
  )
}

export default withMe(RolesForm)
