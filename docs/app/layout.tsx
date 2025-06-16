import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  title: '%s – Republik Styleguide',
}

const navbar = (
  <Navbar
    logo={<b>Republik Docs</b>}
    // ... Your additional navbar options
    projectLink='https://github.com/republik/plattform'
  />
)
const footer = <Footer>© {new Date().getFullYear()} Republik AG.</Footer>

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang='en'
      // Required to be set
      dir='ltr'
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          // banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase={`https://github.com/republik/plattform/blob/${
            process.env.VERCEL_GIT_COMMIT_REF ?? 'main'
          }/docs`}
          footer={footer}
          feedback={{ content: null }}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
