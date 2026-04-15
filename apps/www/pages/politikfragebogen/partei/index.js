import { createGetServerSideProps } from '../../../lib/apollo/helpers'

export default function Page() {
  return null
}

export const getServerSideProps = createGetServerSideProps(async () => {
  return {
    redirect: {
      destination: '/politikfragebogen',
      permanent: false,
    },
  }
})
