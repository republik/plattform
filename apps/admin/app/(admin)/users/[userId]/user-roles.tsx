'use client'
import { Field, Form } from '@/components/ui'
import { Switch } from '@/components/ui/forms/switch'
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
    <Field.Root key={role} name={role} label={role + (loading ? '…' : '')}>
      <Switch
        checked={checked}
        onCheckedChange={(checked) => {
          if (checked) {
            addUserToRole()
          } else {
            removeUserFromRole()
          }
        }}
      />
    </Field.Root>
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
