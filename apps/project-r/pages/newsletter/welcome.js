import React from 'react'
import Head from 'next/head'

import Layout from '../../src/Layout'
import { useRouter } from 'next/router'

export default () => {
  const { query } = useRouter()
  return (
    <Layout>
      <Head>
        <title>Project R Newsletter</title>
      </Head>
      <h2>
        {query.message
          ? query.message
          : 'Welcome aboard!'}
      </h2>
    </Layout>
  )
}
