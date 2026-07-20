import { PagePortableText } from '@/app/(sanity)/components/portable-text/renderPage'
import { PortableTextContentFragmentType } from '@/app/(sanity)/groq/portable-text-content-fragment'

export async function EditorBlock({
  editorBlock,
}: {
  editorBlock: PortableTextContentFragmentType
}) {
  return <PagePortableText value={editorBlock.content} />
}
