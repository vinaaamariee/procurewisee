import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'src');
const EXT = /\.(tsx|ts|css)$/;
const SKIP = new Set(['node_modules', '.next']);
const NAMED = /\b(red|green|blue|orange|yellow|purple|indigo|pink|emerald|teal|cyan|sky|violet|rose|lime|amber)\b/gi;
const OK_CTX = /(className|clsx|cn)\s*[=(]/; // lines that only build class lists are handled by class rules

const hits = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); continue; }
    if (!EXT.test(e.name)) continue;
    const lines = readFileSync(p, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (/\/\//.test(line.split(NAMED)[0] || '') && line.includes('//')) {
        // skip pure comment lines
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
      }
      // look for CSS-ish usage: color props or string values equal to a chromatic name
      const m = line.match(/['"`](?:red|green|blue|orange|yellow|purple|indigo|pink|emerald|teal|cyan|sky|violet|rose|lime|amber)['"`]/i);
      if (m && /(?:color|Color|fill|stroke|background|border|bg|tone|theme)\w*\s*[:=]/i.test(line)) {
        hits.push(`${relative(process.cwd(), p)}:${i + 1}: ${line.trim().slice(0, 160)}`);
      }
    });
  }
})(ROOT);
console.log(hits.length ? hits.join('\n') : 'CLEAN');
