// Shared getter for this module's pre-launch kill-switch env vars (see
// SANITY_PUBLISH_NOTIFICATIONS_ENABLED, SANITY_REDIRECTS_ENABLED,
// SANITY_DISCUSSIONS_ENABLED, SANITY_AUDIO_GENERATION_ENABLED in
// apps/api/.env.example for the full list and what each one gates). Each
// call site keeps its own named export (isRedirectsEnabled, etc.) so it
// stays self-documenting — this only removes the repeated
// `process.env.X === 'true'` check itself.
export const isKillSwitchEnabled = (envVar: string): boolean =>
  process.env[envVar] === 'true'
