import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteAuthor } from '../../authors/actions'

interface DeleteAuthorButtonProps {
  name: string
  id: string
}

const DeleteAuthorButton = ({ name, id }: DeleteAuthorButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  return (
    <>
      <Button
        variant='outline'
        size='2'
        color='red'
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 size={16} />
        Löschen
      </Button>
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Autor*in löschen</AlertDialog.Title>
          <AlertDialog.Description>
            Möchten Sie <strong>{name}</strong> wirklich
            löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialog.Description>
          <Flex justify='end' gap='3' mt='4'>
            <AlertDialog.Cancel>
              <Button variant='outline' size='2'>
                Abbrechen
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant='solid'
                size='2'
                color='red'
                onClick={() => 
                  deleteAuthor(id).then((result) => {
                    if (result?.success) {
                      router.push('/authors')
                    } else {
                      console.error(result.message)
                    }
                  })
                }
              >
                Löschen
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  )
}

export default DeleteAuthorButton
