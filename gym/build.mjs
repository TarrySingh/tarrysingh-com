import { mkdir, rm, cp } from 'node:fs/promises';
import { build } from 'esbuild';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({ entryPoints:['auth-entry.js'], bundle:true, format:'iife', minify:true, outfile:'dist/supabase-bundle.js' });
for (const file of ['index.html','style.css','app.js','auth.js','assets']) await cp(file, 'dist/'+file, { recursive:true });
