export default {
  root: 'new-portfolio',
  base: '/new-portfolio/',  // This is crucial for GitHub Pages deployment
  build: {
    outDir: '../docs/new-portfolio',
    emptyOutDir: true,
  },
  server: {
    open: true
  },
  publicDir: 'assets'
}
