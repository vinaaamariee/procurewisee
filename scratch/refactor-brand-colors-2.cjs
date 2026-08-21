/**
 * Pass 2: migrate to canonical palette #800000/#5C0000/#400000 maroon ramp,
 * #D4AF37/#B8941F gold ramp. Purge blue-tinted slate/zinc neutrals to gray.
 * Gold used as TEXT is routed to the AA-safe --secondary-strong token.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXTS = new Set(['.tsx', '.ts', '.css']);
const SKIP = new Set(['node_modules', '.next']);
// globals.css already migrated by hand
const SKIP_FILES = new Set([path.join(ROOT, 'src', 'app', 'globals.css')]);

const HEX = {
  '7B1E1E': '#800000',
  '5A1515': '#5C0000',
  'A6761D': '#D4AF37'
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out); continue; }
    if (EXTS.has(path.extname(e.name))) out.push(path.join(dir, e.name));
  }
  return out;
}

let changed = 0;
const files = [];
for (const file of walk(ROOT)) {
  if (SKIP_FILES.has(file)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // 1. Gold-as-text -> AA-safe token (before hex swap)
  src = src.replace(/text-\[#A6761[Dd]\]/g, 'text-[var(--secondary-strong)]');
  src = src.replace(/(color)\s*:\s*(['"])(?:var\(--secondary\)|#A6761[Dd])\2/gi,
    '$1: var(--secondary-strong)');

  // 2. Canonical hex swap
  src = src.replace(/#([0-9a-fA-F]{6})\b/g, (m, h) => {
    const up = h.toUpperCase();
    return HEX[up] || m;
  });

  // 3. Brand rgba swaps (any spacing)
  src = src.replace(/rgba\(\s*123\s*,\s*30\s*,\s*30\s*,/g, 'rgba(128, 0, 0,');
  src = src.replace(/rgba\(\s*166\s*,\s*118\s*,\s*29\s*,/g, 'rgba(212, 175, 55,');

  // 4. Blue-tinted slate/zinc neutrals -> pure gray (same shade, keep modifiers + opacity)
  src = src.replace(
    /\b((?:[a-z]+:)*)?(bg|text|border|ring|divide|from|via|to|fill|stroke|outline|shadow|accent)-(?:slate|zinc)-(\d{2,3})(\/\d+)?\b/g,
    (m, mods = '', util, shade, op = '') => `${mods}${util}-gray-${shade}${op}`
  );

  if (src !== before) { fs.writeFileSync(file, src); changed++; files.push(path.relative(ROOT, file)); }
}
console.log(`Modified ${changed} files`);
console.log(files.map(f => '  ' + f).join('\n'));
