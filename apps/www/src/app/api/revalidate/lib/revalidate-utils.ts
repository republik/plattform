import { revalidatePath, revalidateTag } from 'next/cache'
import * as z from 'zod'

const REVALIDATION_REQ_BODY_SCHEMA = z.union([
  z.object({
    type: z.literal('path'),
    value: z.string().startsWith('/'),
  }),
  z.object({
    type: z.literal('paths'),
    value: z.array(z.string().startsWith('/')),
  }),
  z.object({
    type: z.literal('tag'),
    value: z.string(),
  }),
  z.object({
    type: z.literal('tags'),
    value: z.array(z.string()),
  }),
])

/**
 * Revalidate fetch based on a object received from a revalidation request.
 * @param {z.infer<typeof REVALIDATION_REQ_BODY_SCHEMA>} reqBody
 * @example
 * {
 *   type: "path",
 *   value: "/blog"
 * }
 * @example
 * {
 *   type: "paths",
 *   value: ["/blog", "/blog/this-is-the-way"]
 * @example
 * {
 *   type: "tag",
 *   value: "post_preview:1"
 * }
 * @example
 * {
 *   type: "tags",
 *   value: ["post_preview:1", "post_preview:2"]
 * }
 * @returns {Promise<void>} Promise
 * @throws Error if the body is invalid.
 */
export async function revalidateBasedOnReqBody(reqBody: unknown) {
  const parsedBody = REVALIDATION_REQ_BODY_SCHEMA.safeParse(reqBody)

  if (parsedBody.success) {
    const { type, value } = parsedBody.data
    if (type === 'path') {
      revalidatePath(value)
    } else if (type === 'paths') {
      value.forEach((path) => revalidatePath(path))
    } else if (type === 'tag') {
      revalidateTag(value)
    } else if (type === 'tags') {
      value.forEach((tag) => revalidateTag(tag))
    }
  } else {
    throw new Error('invalid body')
  }
}
