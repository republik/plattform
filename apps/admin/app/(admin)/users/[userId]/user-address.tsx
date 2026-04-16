'use client'
import { Card, CardTitle } from '@/components/card'
import { Button, Form, Input } from '@/components/ui'
import { TextField } from '@/components/ui/forms/field'
import {
  UpdateUserAddressDocument,
  UpdateUserDetailsMutationVariables,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { z } from '@/lib/zod'
import { useMutation } from '@apollo/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { useUserProfileData } from './use-user-profile-data'

const OptionalString = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().nullable(),
)

const UserFormInput = z.object({
  organization: OptionalString,
  name: z.string(),
  line1: z.string(),
  line2: OptionalString,
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
})

export function EditUserAddress({
  userId,
  values,
}: {
  userId: string
  values: UpdateUserDetailsMutationVariables
  onComplete?: () => void
}) {
  const [updateUserDetails, { loading, error }] = useMutation(
    UpdateUserAddressDocument,
    {
      onError: (err) => {
        toast.error('Ups!', { description: err.message })
      },
    },
  )

  const { address } = values

  return (
    <Form
      action={async (formData) => {
        const values = Object.fromEntries(formData.entries())
        const fields = UserFormInput.safeParse({
          ...values,
          gender: values.customGender || values.selectedGender,
        })

        if (fields.success) {
          updateUserDetails({ variables: { id: userId, address: fields.data } })
        } else {
          toast.error('Ups!', { description: z.prettifyError(fields.error) })
        }
      }}
    >
      <TextField name='organization' label='Organisation'>
        <Input type='text' defaultValue={address?.organization ?? ''} />
      </TextField>
      <TextField name='name' label='Name'>
        <Input type='text' required defaultValue={address?.name ?? ''} />
      </TextField>
      <TextField name='line1' label='Straße'>
        <Input type='text' required defaultValue={address?.line1 ?? ''} />
      </TextField>
      <TextField name='line2' label='Zusatz'>
        <Input type='text' defaultValue={address?.line2 ?? ''} />
      </TextField>
      <TextField name='postalCode' label='Postleitzahl'>
        <Input type='text' required defaultValue={address?.postalCode ?? ''} />
      </TextField>
      <TextField name='city' label='Stadt'>
        <Input type='text' required defaultValue={address?.city ?? ''} />
      </TextField>
      <TextField name='country' label='Land'>
        <Input type='text' required defaultValue={address?.country ?? ''} />
      </TextField>
      <div>
        <Button type='submit' disabled={loading}>
          Speichern
        </Button>
      </div>
    </Form>
  )
}

export function UserDetails() {
  const user = useUserProfileData()

  if (!user) return null

  const { email, address } = user

  return (
    <Card>
      <CardTitle>E-Mail-Adresse</CardTitle>
      <Link href={`mailto:${email}`}>{email}</Link>

      <CardTitle>Adresse</CardTitle>
      {address ? (
        <div>
          <div>{address.organization}</div>
          <div>{address.name}</div>
          <div>{address.line1}</div>
          <div>{address.line2}</div>
          <div>{address.postalCode}</div>
          <div>{address.city}</div>
          <div>{address.country}</div>
        </div>
      ) : (
        '–'
      )}

      <Link href={`/users/${user.id}/details`}>Bearbeiten</Link>
    </Card>
  )
}
