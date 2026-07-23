import { PreviewThemeListener } from '@/app/(sanity)/components/preview-theme-listener'

// Group-level layout for all preview routes. Mounts the dark-mode listener once
// so the Studio preview toggle works across articles/front/pages, without
// duplicating the per-section SanityLive/VisualEditing setup.
export default function SanityGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <PreviewThemeListener />
      {children}
    </>
  )
}
