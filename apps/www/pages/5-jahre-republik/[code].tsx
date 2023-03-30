import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
    redirect: {
      destination: '/5-jahre-republik',
      permanent: false,
    },
  }
}

export default function Page() {
  return undefined
}
