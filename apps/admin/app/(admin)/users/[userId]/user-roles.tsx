'use client'
import { Form } from '@/components/ui'
import { InlineField } from '@/components/ui/forms/field'
import { Switch } from '@/components/ui/forms/switch'
import { toast } from 'sonner'
import {
  AddUserToRoleDocument,
  RemoveUserFromRoleDocument,
  UserProfileDocument,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'

const ROLES = [
  'editor',
  'producer',
  'supporter',
  'accountant',
  'moderator',
  'admin',
  'accomplice',
  'tester',
  'debater',
  'author',
  'member',
]

function EditRoleSwitch({ userId, role, checked }) {
  const [removeUserFromRole, { loading: removeLoading, error: removeError }] =
    useMutation(RemoveUserFromRoleDocument, {
      variables: { userId, role },
      refetchQueries: [UserProfileDocument],
    })
  const [addUserToRole, { loading: addLoading, error: addError }] = useMutation(
    AddUserToRoleDocument,
    {
      variables: { userId, role },
      refetchQueries: [UserProfileDocument],
    },
  )

  const loading = addLoading || removeLoading

  return (
    <InlineField key={role} name={role} label={role + (loading ? '…' : '')}>
      <Switch
        checked={checked}
        onCheckedChange={(checked) => {
          const action = checked ? addUserToRole : removeUserFromRole

          action()
            .then(() => {
              toast(`Rolle '${role}' ${checked ? 'hinzugefügt' : 'entfernt'}.`)
            })
            .catch((err) => {
              toast.error('Ups!', { description: err.message })
            })
        }}
      />
    </InlineField>
  )
}

export function EditUserRoles({
  userId,
  roles,
  onComplete,
}: {
  userId: string
  roles: string[]
  onComplete?: () => void
}) {
  return (
    <Form>
      {ROLES.map((role) => (
        <EditRoleSwitch
          key={role}
          userId={userId}
          role={role}
          checked={roles.includes(role)}
        />
      ))}
    </Form>
  )
}
