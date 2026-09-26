import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';

await build({
  entryPoints: ['src/app.js'],
  outfile: 'dist/app.js',
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  target: ['es2022'],
  legalComments: 'eof',
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: { js: '/*! React Bits components © 2026 David Haz. MIT + Commons Clause. See /react-bits-license.txt. */' },
});
await copyFile('src/vendor/react-bits/LICENSE.md', 'dist/react-bits-license.txt');
console.log('Bundled React Bits motion.');
