const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['src/Executables/exec-pkg.js'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/exec-pkg.js',
}).catch(() => process.exit(1))
