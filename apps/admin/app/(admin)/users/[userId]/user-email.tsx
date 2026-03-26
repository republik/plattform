'use client'
import { EditInline } from '@/components/edit-inline'
import {
  UserProfileDocument,
  UpdateUserEmailDocument,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Form, Field, Input, Button } from '@republik/ui'

export function EditUserEmail({
  userId,
  email,
  onComplete,
}: {
  userId: string
  email: string
  onComplete?: () => void
}) {
  const [updateEmail, { loading, error }] = useMutation(
    UpdateUserEmailDocument,
    {},
  )

  const formErrors = error ? { email: error?.message } : {}

  return (
    <Form
      errors={formErrors}
      onFormSubmit={async ({ email }) => {
        try {
          await updateEmail({ variables: { id: userId, email } })
          onComplete?.()
        } catch {}
      }}
    >
      <Field.Root name='email' label='E-Mail'>
        <Input type='email' defaultValue={email} />
      </Field.Root>

      <div>
        <Button type='submit' disabled={loading}>
          Ändern
        </Button>
      </div>
    </Form>
  )
}

export function UserEmail({ userId }: { userId: string }) {
  const { data } = useQuery(UserProfileDocument, {
    variables: {
      id: userId,
    },
  })

  return (
    <EditInline
      title='E-Mail-Adresse'
      renderEditing={({ onComplete }) => (
        <EditUserEmail
          key={data?.user?.email}
          userId={userId}
          email={data?.user?.email ?? ''}
          onComplete={onComplete}
        />
      )}
    >
      {data?.user?.email}
    </EditInline>
  )
}
