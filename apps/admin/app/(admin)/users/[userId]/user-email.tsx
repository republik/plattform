'use client'
import { Button, Form, Input } from '@/components/ui'
import { TextField } from '@/components/ui/forms/field'
import { UpdateUserEmailDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { z } from '@/lib/zod'

const UserFormInput = z.object({
  email: z.email(),
})

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
    {
      onError: (err) => {
        toast.error('Ups!', { description: err.message })
      },
    },
  )

  return (
    <Form
      action={async (formData) => {
        const values = Object.fromEntries(formData.entries())
        const fields = UserFormInput.safeParse(values)
        if (fields.success) {
          await updateEmail({
            variables: { id: userId, email: fields.data.email },
          })
          onComplete?.()
        } else {
          toast.error('Ups!', { description: z.prettifyError(fields.error) })
        }
      }}
    >
      <TextField name='email' label='E-Mail'>
        <Input type='email' defaultValue={email} />
      </TextField>

      <div>
        <Button type='submit' disabled={loading}>
          Speichern
        </Button>
      </div>
    </Form>
  )
}
