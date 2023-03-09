import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Republik</span>,
  docsRepositoryBase: 'https://github.com/republik/plattform/blob/main/docs/',
  project: {
    link: 'https://github.com/republik/plattform',
  },
  feedback: { content: null },
  footer: { text: null },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Republik Docs',
      description: 'Hello',
    }
  },
  head: null,
}

export default config
