import { Request, Response } from 'express'
// Brings in the `req.log` augmentation on express's Request.
import type {} from '@orbiting/backend-modules-logger'

const { vimeo, youtube } = require('@orbiting/backend-modules-embeds')

const PLATFORMS: Record<
  string,
  { REGEX: RegExp; get: (id: string) => Promise<any> }
> = {
  vimeo,
  youtube,
}

// Called directly by studio's browser UI (workspaces/newsroom, see
// EmbedVideoInput.tsx) when an editor clicks "Daten abrufen" on a pasted
// Vimeo/YouTube URL. A plain read-through proxy to the platform APIs — it
// never touches the Sanity document itself (the studio component patches the
// response onto the object's fields directly), so unlike generate-audio it
// needs no async round trip and can sit behind the same scoped read token as
// subscriber-count. Field names in the response match embedVideo.ts's schema
// 1:1 so the caller can patch them without any renaming.
export const fetchEmbedVideoHandler = async (req: Request, res: Response) => {
  const platform = req.query.platform
  const url = req.query.url
  if (typeof platform !== 'string' || !PLATFORMS[platform]) {
    return res
      .status(400)
      .json({ error: 'platform must be one of: vimeo, youtube' })
  }
  if (typeof url !== 'string' || !url) {
    return res.status(400).json({ error: 'missing url' })
  }

  const { REGEX, get } = PLATFORMS[platform]
  const match = REGEX.exec(url)
  const id = match?.[1]
  if (!id) {
    return res
      .status(400)
      .json({ error: `url does not look like a ${platform} video url` })
  }

  try {
    const video = await get(id)
    return res.json({
      id: video.id,
      title: video.title,
      createdAt: video.createdAt?.toISOString?.() ?? video.createdAt,
      retrievedAt: video.retrievedAt?.toISOString?.() ?? video.retrievedAt,
      userName: video.userName,
      userUrl: video.userUrl,
      userProfileImageUrl: video.userProfileImageUrl,
      thumbnail: video.thumbnail,
      aspectRatio: video.aspectRatio,
      durationMs: video.durationMs,
      mediaId: `${platform}-${video.id}`,
      src: video.src ?? undefined,
    })
  } catch (error: any) {
    req.log.error(
      { error, platform, url },
      'failed to fetch embed video metadata',
    )
    return res.status(502).json({ error: error?.message ?? 'fetch failed' })
  }
}
