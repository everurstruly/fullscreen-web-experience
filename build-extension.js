import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function build() {
  const outdir = path.resolve('dist-extension');

  console.log('🚀 Compiling Loupe Chrome Extension components...');

  // Ensure output directory exists
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }

  // Bundle background worker, content script, and popup settings
  await esbuild.build({
    entryPoints: {
      'background': 'src/background/service-worker.ts',
      'content': 'src/content/index.ts',
      'popup': 'src/popup/popup.ts'
    },
    bundle: true,
    outdir,
    platform: 'browser',
    target: 'es2022',
    format: 'iife', // Safe CJS-like wrapping for standard browser environments
    minify: false,
    sourcemap: false
  });

  // Copy static configuration assets
  fs.copyFileSync('manifest.json', path.join(outdir, 'manifest.json'));
  fs.copyFileSync('popup.html', path.join(outdir, 'popup.html'));

  // Ensure mock icon directory is populated so Chrome doesn't throw warnings
  const iconDir = path.join(outdir, 'icons');
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  // 1x1 transparent pixel PNG buffer
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Png, 'base64');
  fs.writeFileSync(path.join(iconDir, 'icon16.png'), buffer);
  fs.writeFileSync(path.join(iconDir, 'icon48.png'), buffer);
  fs.writeFileSync(path.join(iconDir, 'icon128.png'), buffer);

  console.log('✅ Success! Extracted unpacked Chrome Extension directly inside "/dist-extension".');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
