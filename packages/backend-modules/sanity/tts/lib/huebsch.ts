export class HuebschError extends Error {}

// Huebsch's API/webhook responses use a documented Result pattern:
//   { ok: true, val: ... }
//   { ok: false, val: { error, code, message?, issues?: [{ path, message }] } }
// This turns the error half into a readable string instead of a raw JSON dump.
interface HuebschResultError {
  error?: string
  code?: string
  message?: string
  issues?: { path?: unknown[]; message?: string }[]
}

// Exported for direct unit testing. Its formatting logic is worth testing in
// isolation from the fetch/HTTP plumbing around it.
export const describeHuebschError = (val: unknown): string => {
  const v = val as HuebschResultError | undefined
  if (!v || typeof v !== 'object' || (!v.error && !v.code)) {
    return JSON.stringify(val)
  }

  const errorAndMessage =
    v.message && v.message !== v.error ? `${v.error}: ${v.message}` : v.error

  const parts = [v.code ? `[${v.code}]` : undefined, errorAndMessage].filter(
    Boolean,
  )

  const issues = (v.issues ?? [])
    .map((issue) =>
      issue?.path?.length
        ? `${issue.path.join('.')}: ${issue.message}`
        : issue?.message,
    )
    .filter(Boolean)

  return [parts.join(' '), issues.length ? `(${issues.join(', ')})` : '']
    .filter(Boolean)
    .join(' ')
}

const intakeUrl = () => {
  const url = process.env.HUEBSCH_API_URL
  const apiKey = process.env.HUEBSCH_API_KEY
  if (!url) throw new Error('HUEBSCH_API_URL is not set')
  if (!apiKey) throw new Error('HUEBSCH_API_KEY is not set')
  return `${url}/intake/republik/${apiKey}`
}

export const uploadToHuebsch = async (
  speakableContent: unknown[],
  documentId: string,
  slug: string,
  title: string,
  webhookUrl: string,
  options?: { description?: string; source?: string },
) => {
  const res = await fetch(intakeUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // if the Huebsch intake API changes this is the part you probably need to adapt:
    body: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'article',
          attrs: {
            title,
            slug,
            webhook: webhookUrl,
            meta: { format: 'article' },
            // 256 char max per the intake docs
            ...(options?.description && {
              description: options.description.slice(0, 256),
            }),
            ...(options?.source && { source: options.source }),
          },
          content: speakableContent,
        },
      ],
    }),
  })

  const json = (await res.json().catch(() => null)) as {
    ok?: boolean
    val?: unknown
  } | null

  if (!res.ok || json?.ok === false) {
    throw new HuebschError(
      `huebsch intake failed for ${documentId}: ${describeHuebschError(json?.val)}`,
    )
  }

  return json
}

export interface HuebschChapter {
  name: string
  at: number
}

export interface HuebschResult {
  audioFile: ArrayBuffer
  durationMs?: number
  chapters?: HuebschChapter[]
  [key: string]: unknown
}

export const getFromHuebsch = async (
  body: unknown,
): Promise<HuebschResult> => {
  const parsed = body as
    | { ok?: boolean; val?: Record<string, unknown> }
    | undefined

  if (parsed?.ok === false) {
    throw new HuebschError(
      `huebsch reported a failed generation: ${describeHuebschError(parsed.val)}`,
    )
  }

  const val = parsed?.val
  const audioUrl = val?.asset as string | undefined

  if (!audioUrl) {
    throw new HuebschError(
      `Huebsch webhook payload had no asset url: ${JSON.stringify(body)}`,
    )
  }

  const res = await fetchWithRetry(audioUrl)
  const audioFile = await res.arrayBuffer()

  // Huebsch's Track payload reports `duration` in seconds (per its docs) —
  // converted to ms here since that's what we store. We round it anyway, so
  // there's no reason to also carry a whole mp3-parsing dependency just to
  // re-derive the same number from the downloaded bytes.
  const durationSeconds = val?.duration as number | undefined

  return {
    ...val,
    audioFile,
    durationMs:
      typeof durationSeconds === 'number'
        ? Math.round(durationSeconds * 1000)
        : undefined,
    chapters: val?.chapters as HuebschChapter[] | undefined,
  }
}

const fetchWithRetry = async (
  url: string,
  retries = 3,
  waitForMs = 1000,
): Promise<Response> => {
  let lastError: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`response not ok with status ${res.status}`)
      }
      return res
    } catch (e) {
      lastError = e
      await new Promise((resolve) => setTimeout(resolve, waitForMs))
    }
  }
  throw new HuebschError(
    `failed to fetch ${url} after ${retries} attempts: ${lastError}`,
  )
}
