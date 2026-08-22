/**
 * GitHub Pages serves static files, so a deep link like /enclave/vault has no
 * file behind it and 404s. Pages falls back to 404.html for unknown paths, and
 * this app is a single page, so shipping a copy of index.html under that name
 * lets the router pick the URL up and render the right screen.
 *
 * .nojekyll stops Pages running the content through Jekyll, which would strip
 * anything beginning with an underscore.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html is missing — run the build first.')
  process.exit(1)
}

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('dist/404.html and dist/.nojekyll written')
