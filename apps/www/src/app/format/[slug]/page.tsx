import { PageLayout } from '@app/components/layout'
import { getDocument } from '../../../../components/Article/graphql/getDocument'
import { cleanAsPath } from '../../../../lib/utils/link'
import { getClient } from '../../../lib/apollo/client'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  const cleanedPath = cleanAsPath(`/format/${params.slug}`)

  try {
    const { data } = await getClient().query({
      query: getDocument,
      variables: {
        path: cleanedPath,
      },
      errorPolicy: 'all',
    })

    console.log(data)
    
    return (
      <PageLayout>
        <div>
          <h1>{data.article.meta.title}</h1>
        </div>
      </PageLayout>
    )
  } catch (error) {
    console.log(error)
    
    return (
      <PageLayout>
        <div>Format - Error loading article</div>
      </PageLayout>
    )
  }
}
