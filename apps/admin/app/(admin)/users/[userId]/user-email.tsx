'use client'
import { UpdateUserEmailDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Button, Field, Form, Input } from '@republik/ui'

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
