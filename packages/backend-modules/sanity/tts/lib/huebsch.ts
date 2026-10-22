import { isIP } from 'node:net'

export class HuebschError extends Error {}

const isPrivateIPv4 = (ip: string): boolean => {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 || // "this" network
    a === 10 ||
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local, cloud metadata (169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) || // IETF protocol assignments
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    a >= 224 // multicast, reserved, broadcast
  )
}

const isPrivateIPv6 = (ip: string): boolean => {
  const v = ip.toLowerCase()
  if (v === '::' || v === '::1') return true
  // IPv4-mapped (::ffff:a.b.c.d or ::ffff:7f00:1)
  const mapped = v.match(/^::ffff:(.+)$/)
  if (mapped) {
    const rest = mapped[1]
    if (isIP(rest) === 4) return isPrivateIPv4(rest)
    const hex = rest.split(':').map((h) => parseInt(h, 16))
    if (hex.length === 2 && hex.every((n) => !Number.isNaN(n))) {
      return isPrivateIPv4(
        [hex[0] >> 8, hex[0] & 255, hex[1] >> 8, hex[1] & 255].join('.'),
      )
    }
    return true
  }
  return (
    /^f[cd]/.test(v) || // unique local fc00::/7
    /^fe[89ab]/.test(v) || // link-local fe80::/10
    /^ff/.test(v) // multicast
  )
}

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.localdomain',
  '.lan',
  '.home.arpa',
]

/**
 * Validates that the asset url from the (unsigned) Huebsch webhook body is
 * safe to fetch server-side: https only, no credentials, no loopback /
 * private / link-local / metadata addresses or obvious internal hostnames.
 * If HUEBSCH_ASSET_HOSTS (comma separated hostnames) is set, the host must
 * additionally be in that list (exact match or subdomain).
 *
 * Limitation: this checks literals only. A public hostname that resolves to a
 * private IP (DNS rebinding / attacker-controlled DNS) is NOT caught here;
 * set HUEBSCH_ASSET_HOSTS to close that gap.
 */
export const assertSafeAssetUrl = (value: string): URL => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new HuebschError('Huebsch asset url is not a valid url')
  }

  if (url.protocol !== 'https:') {
    throw new HuebschError('Huebsch asset url must use https')
  }
  if (url.username || url.password) {
    throw new HuebschError('Huebsch asset url must not contain credentials')
  }

  // WHATWG URL already normalizes decimal/octal/hex IPv4 forms to dotted quad
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  const bare = host.replace(/^\[|\]$/g, '')
  const ipVersion = isIP(bare)

  if (
    (ipVersion === 4 && isPrivateIPv4(bare)) ||
    (ipVersion === 6 && isPrivateIPv6(bare)) ||
    (ipVersion === 0 &&
      (host === 'localhost' ||
        !host.includes('.') ||
        BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => host.endsWith(suffix))))
  ) {
    throw new HuebschError('Huebsch asset url points to a disallowed host')
  }

  const allowed = (process.env.HUEBSCH_ASSET_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
  if (
    allowed.length > 0 &&
    !allowed.some((h) => host === h || host.endsWith(`.${h}`))
  ) {
    throw new HuebschError('Huebsch asset url host is not in the allowlist')
  }

  return url
}

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
  slug: string | undefined,
  title: string,
  webhookUrl: string,
  options?: { description?: string; source?: string; format?: string },
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
            webhook: webhookUrl,
            // The legacy republik/tts service sent the Publikator format's
            // repo id here; it's now derived from the article's Spitzmarke
            // (see tts/lib/format.ts), with the same org-qualified fallback
            // for an article that has none.
            meta: { format: options?.format ?? 'republik/article' },
            // Huebsch validates slug's format when present ("alphanumeric,
            // hyphens and slashes, beginning with a slash") — it's an
            // identifier, not spoken content, and a document with no real
            // slug yet (e.g. an automatic-slug article, deliberately left
            // empty until it's actually published) has nothing valid to
            // offer, so it's omitted rather than sent as some synthesized
            // placeholder value.
            ...(slug && { slug }),
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
      `huebsch intake failed for ${documentId}: ${describeHuebschError(
        json?.val,
      )}`,
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

export const parseHuebschResult = async (
  body: unknown,
): Promise<HuebschResult> => {
  const parsed = body as
    | { ok?: boolean; val?: Record<string, unknown> }
    | undefined

  if (parsed?.ok === false) {
    throw new HuebschError(
      `huebsch reported a failed generation: ${describeHuebschError(
        parsed.val,
      )}`,
    )
  }

  const val = parsed?.val
  const audioUrl = val?.asset as string | undefined

  if (!audioUrl) {
    throw new HuebschError(
      `Huebsch webhook payload had no asset url: ${JSON.stringify(body)}`,
    )
  }

  const safeUrl = assertSafeAssetUrl(audioUrl)

  const res = await fetchWithRetry(safeUrl.toString())
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
      // never follow redirects blindly, they could lead to internal hosts
      const res = await fetch(url, { redirect: 'manual' })
      if (res.status >= 300 && res.status < 400) {
        throw new HuebschError(
          `unexpected redirect (${res.status}) fetching ${url}`,
        )
      }
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
