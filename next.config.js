/** @type {import('next').NextConfig} */

// GitHub Pages project deploy: https://hynr.github.io/portfolio/
// basePath/assetPrefix gate on the GITHUB_PAGES env var so local `next dev`
// still serves at the root.
const isGhPages = process.env.GITHUB_PAGES === 'true'
const repoBasePath = '/portfolio'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGhPages ? repoBasePath : '',
  assetPrefix: isGhPages ? repoBasePath : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isGhPages ? repoBasePath : '',
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
