import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong>Republik Docs</strong>,
  docsRepositoryBase: `https://github.com/republik/plattform/blob/${
    process.env.VERCEL_GIT_COMMIT_REF ?? 'main'
  }/docs/`,
  project: {
    link: 'https://github.com/republik/plattform',
  },
  primaryHue: 260,
  feedback: { content: null },
  footer: { text: null },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Republik Styleguide',
      description: 'Hello',
    }
  },
  head: null,
}

export default config
