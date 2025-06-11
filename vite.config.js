export default {
  root: 'new-portfolio',
  base: '/new-portfolio/',  // This is crucial for GitHub Pages deployment
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true
  },
  publicDir: 'assets'
}
