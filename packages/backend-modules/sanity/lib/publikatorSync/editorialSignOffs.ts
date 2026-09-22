// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Mirrors Publikator's editorial checklist (publikator.milestones, scope
// 'milestone') into Sanity's `editorialSignOffs` — the field Studio's own
// workflow badge/banner/desk groups read to derive an article's phase (see
// studio's workspaces/newsroom/schema/article/workflow/{definitions,status}.ts
// and objects/signOff.ts). Without this, every Publikator-sourced article
// reads as permanently "Entwurf" in Sanity regardless of its real progress.
//
// Checklist milestones are never revoked: unchecking a box in Publikator
// hard-deletes the row (removeMilestone.js), it doesn't set revokedAt — that
// column only means something for scope 'publication'/'prepublication' rows
// (see formatFields.ts). So the query here just filters scope: 'milestone',
// no revokedAt check.
import type { PgDb } from '@orbiting/backend-modules-types'

export interface ChecklistMilestone {
  name: string
  userId?: string | null
  author?: { name?: string } | null
  createdAt: string | Date
}

export async function fetchChecklistMilestones(
  repoId: string,
  pgdb: PgDb,
): Promise<ChecklistMilestone[]> {
  return pgdb.publikator.milestones.find(
    { repoId, scope: 'milestone' },
    { orderBy: { createdAt: 'asc' } },
  )
}

// Publikator's full checklist (apps/publikator/components/VersionControl/
// Checklist.js) has 11 named milestones; Sanity's CHECKLIST_ITEMS (studio's
// workflow/definitions.ts) only has 6 — the rest (startTC, startCR,
// numbersOk, imagesOk, factCheckOk, ...) have no Sanity slot and are simply
// dropped. `finalControl` is a deliberate rename, not a typo: it's the
// milestone behind Publikator's "Endkontrolle OK" step, which Sanity's
// schema calls `endkontrolleOk`. Keep this in sync manually with studio's
// definitions.ts — two separate repos, no shared types possible.
const MILESTONE_NAME_TO_ITEM_KEY: Record<string, string> = {
  startCreation: 'startCreation',
  finalEditing: 'finalEditing',
  startProduction: 'startProduction',
  startProofReading: 'startProofReading',
  proofReadingOk: 'proofReadingOk',
  finalControl: 'endkontrolleOk',
}

export interface SignOff {
  _key: string
  _type: 'signOff'
  itemKey: string
  userId?: string
  userName?: string
  signedAt: string
}

// versionRef (the schema's 5th signOff field) is deliberately never set here
// either — Studio's own SignOffChecklist input omits it too ("prefer absent
// over a volatile draft _rev").
export function buildEditorialSignOffs(
  milestones: ChecklistMilestone[],
): SignOff[] | undefined {
  const entries = milestones
    .map((milestone): SignOff | undefined => {
      const itemKey = MILESTONE_NAME_TO_ITEM_KEY[milestone.name]
      if (!itemKey) return undefined
      return {
        _key: itemKey,
        _type: 'signOff',
        itemKey,
        ...(milestone.userId ? { userId: milestone.userId } : {}),
        ...(milestone.author?.name ? { userName: milestone.author.name } : {}),
        signedAt: new Date(milestone.createdAt).toISOString(),
      }
    })
    .filter((entry): entry is SignOff => Boolean(entry))
  return entries.length ? entries : undefined
}
