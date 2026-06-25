import type { Html } from '@/sanity.types'

export function Html({ value }: { value: Html }) {
  return <div dangerouslySetInnerHTML={{ __html: value.html }}></div>
}
