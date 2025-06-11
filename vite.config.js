export default {
  root: 'new-portfolio',
  base: '/',  // Updated for GitHub Pages at root domain
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    open: true
  },
  publicDir: 'assets'
}
