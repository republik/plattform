import { createGetServerSideProps } from '../../lib/apollo/helpers'

export const getServerSideProps = createGetServerSideProps(async () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // getMonth() returns 0-11

  return {
    redirect: {
      destination: `/archiv/${year}/${month}`,
      permanent: false,
    },
  }
})

export default function ArchivRedirect() {
  return null
}
