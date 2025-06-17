import nextra from 'nextra'
import { rehypeComponentDemo } from './lib/rehype/rehype-component-demo.mjs'
import { withDocs } from './lib/with-docs.mjs'

const withNextra = nextra({
  mdxOptions: { rehypePlugins: [rehypeComponentDemo] },
  latex: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@republik/ui-docs-demo'],
}

export default withDocs(withNextra(nextConfig))
