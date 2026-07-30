import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'

const staticRoutes = [
  '/',
  '/inventory',
  '/pre-order',
  '/auctions',
  '/corporate',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
]

const siteUrl = process.env.VITE_SITE_URL || 'https://www.emphatonautos.com'

function staticPagesPlugin() {
  return {
    name: 'static-pages',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexHtml = resolve(outDir, 'index.html')
      if (!existsSync(indexHtml)) return
      const content = readFileSync(indexHtml, 'utf-8')
      for (const route of staticRoutes) {
        if (route === '/') continue
        const dir = resolve(outDir, route.slice(1))
        mkdirSync(dir, { recursive: true })
        writeFileSync(resolve(dir, 'index.html'), content)
      }

      // 404 page
      writeFileSync(resolve(outDir, '404.html'), content)

      // Sitemap
      const urls = staticRoutes.map(r => `${siteUrl}${r}`)
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap)
      writeFileSync(resolve(outDir, 'robots.txt'), 'User-agent: *\nDisallow: /admin/\nSitemap: /sitemap.xml')

      console.log(`[static-pages] Generated ${staticRoutes.length} route copies + 404.html + sitemap + robots.txt`)
    },
  }
}

export default defineConfig({
  plugins: [react(), staticPagesPlugin()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
