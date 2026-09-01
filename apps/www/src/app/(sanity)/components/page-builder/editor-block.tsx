import { PagePortableText } from '@/app/(sanity)/components/portable-text/renderPage'
import { PagePortableTextContentFragmentType } from '@/app/(sanity)/groq/portable-text-content-fragment'

export async function EditorBlock({
  editorBlock,
}: {
  editorBlock: PagePortableTextContentFragmentType
}) {
  return <PagePortableText value={editorBlock.content} />
}
