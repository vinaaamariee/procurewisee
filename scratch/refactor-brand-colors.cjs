/**
 * Brand color enforcement: Maroon #7B1E1E + Gold #A6761D only.
 * - Normalizes off-brand hex values
 * - Converts chromatic rgba() to brand rgba()
 * - Maps chromatic Tailwind utility classes to brand CSS-variable tokens
 * Neutrals (white/black/grays) are left intact.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXTS = new Set(['.tsx', '.ts', '.css']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

// ---------- 1. Hex normalization ----------
const HEX = {
  // Off-brand maroons/reds -> canonical brand
  '3B0A0A': '#5A1515', '4B0B0E': '#5A1515', '5E1414': '#5A1515',
  '601717': '#7B1E1E', '651517': '#7B1E1E', '701919': '#7B1E1E', '74171B': '#7B1E1E',
  '7E191B': '#7B1E1E', '842222': '#7B1E1E', '922424': '#7B1E1E', '952929': '#7B1E1E',
  '962124': '#7B1E1E', '991B1B': '#7B1E1E', '9B2626': '#7B1E1E', 'A82025': '#7B1E1E',
  'B7202E': '#7B1E1E', 'DC2626': '#7B1E1E', 'E11D48': '#7B1E1E', '7F1D1D': '#7B1E1E',
  // Golds -> canonical gold
  '8A621A': '#A6761D', 'B88A10': '#A6761D', 'B88A1B': '#A6761D', 'B45309': '#A6761D',
  'CA8A04': '#A6761D', 'C4A035': '#A6761D', 'C8982A': '#A6761D', 'C89B3C': '#A6761D',
  'D4A017': '#A6761D', 'DCB353': '#A6761D', 'F59E0B': '#A6761D', 'FACC15': '#A6761D',
  'F5C842': '#A6761D',
  // Blues / indigos / violets / greens -> maroon
  '0B3B6E': '#7B1E1E', '0B2D5C': '#7B1E1E', '1A5BA8': '#7B1E1E', '1E40AF': '#7B1E1E',
  '1E3A8A': '#7B1E1E', '3B82F6': '#7B1E1E', '2563EB': '#7B1E1E', '6366F1': '#7B1E1E',
  '4F46E5': '#7B1E1E', '8B5CF6': '#7B1E1E', '047857': '#7B1E1E', '059669': '#7B1E1E',
  '10B981': '#7B1E1E', '166534': '#7B1E1E',
  // Navy-tinted dark surfaces -> warm dark neutrals
  '161D2C': '#211B17', '0E1420': '#181411', '2A3345': '#2B241F', '141519': '#181411',
  '0D0E12': '#181411',
  // Blue-tinted lights -> warm paper / neutral gray
  'EEF1F6': '#FAF9F6', 'F7F8FA': '#FAF9F6', 'E2E8F0': '#E5E7EB', 'CBD5E1': '#D1D5DB'
};
// Special: light pink tint -> glass token
const HEX_TOKEN = { 'FECACA': 'var(--accent-glass)' };

// ---------- 2. Tailwind class mapping ----------
const COOL = '(?:blue|sky|cyan|teal|emerald|green|lime|indigo|violet|purple|fuchsia|pink|rose|red)';
const WARM = '(?:amber|yellow|orange)';
const SHADE = '\\d{2,3}';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else if (EXTS.has(path.extname(e.name))) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

let totalChanges = 0;
const fileReport = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // --- hex ---
  src = src.replace(/#([0-9a-fA-F]{6})\b/g, (m, h) => {
    const up = h.toUpperCase();
    if (HEX_TOKEN[up]) return HEX_TOKEN[up];
    if (HEX[up]) return HEX[up];
    return m;
  });
  // --- 3-digit hexes of brand shades (e.g. #f00 unlikely; skip) ---

  // --- generic rgba()/rgb() chromatic conversion ---
  src = src.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/gi,
    (m, r, g, b, a) => {
      r = +r; g = +g; b = +b;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const chroma = max - min;
      if (chroma < 12) return m; // achromatic neutral — keep
      let hue;
      if (max === r) hue = ((g - b) / chroma) % 6;
      else if (max === g) hue = (b - r) / chroma + 2;
      else hue = (r - g) / chroma + 4;
      hue = Math.round(hue * 60); if (hue < 0) hue += 360;
      const alpha = a !== undefined ? `, ${a}` : '';
      const fn = a !== undefined ? 'rgba' : 'rgb';
      if (hue >= 15 && hue <= 70) return `${fn}(166, 118, 29${alpha})`;   // gold
      return `${fn}(123, 30, 30${alpha})`;                                  // maroon
    });

  // --- Tailwind classes ---
  // Backgrounds: tints (shade<=100 or any /opacity) -> glass/dim; solids -> accent/secondary
  src = src.replace(new RegExp(`bg-(${COOL})-(${SHADE})(\\\/(\\d+))?`, 'g'), (m, c, sh, _x, op) => {
    if (op || +sh <= 100) return 'bg-[var(--accent-glass)]';
    return 'bg-[var(--accent)]';
  });
  src = src.replace(new RegExp(`bg-(${WARM})-(${SHADE})(\\\/(\\d+))?`, 'g'), (m, c, sh, _x, op) => {
    if (op || +sh <= 100) return 'bg-[var(--secondary-dim)]';
    return 'bg-[var(--secondary)]';
  });

  // Text colors
  src = src.replace(new RegExp(`text-(${WARM})-(${SHADE})`, 'g'), () => 'text-[var(--secondary)]');
  src = src.replace(new RegExp(`text-(${COOL})-(${SHADE})`, 'g'), (m, c, sh) => {
    return +sh <= 400 ? 'text-[var(--secondary)]' : 'text-[var(--accent)]';
  });

  // Borders / dividers: light -> border-accent, strong -> accent/secondary
  src = src.replace(new RegExp(`(?:border|divide)-(${COOL})-(${SHADE})`, 'g'), (m, c, sh) => {
    return +sh <= 300 ? 'border-[var(--border-accent)]' : 'border-[var(--accent)]';
  });
  src = src.replace(new RegExp(`(?:border|divide)-(${WARM})-(${SHADE})`, 'g'), (m, c, sh) => {
    return +sh <= 300 ? 'border-[var(--border-accent)]' : 'border-[var(--secondary)]';
  });

  // Rings / outlines: subtle halos -> glass tokens
  src = src.replace(new RegExp(`ring-(${COOL})-(${SHADE})(\\\/(\\d+))?`, 'g'),
    () => 'ring-[var(--accent-glass)]');
  src = src.replace(new RegExp(`ring-(${WARM})-(${SHADE})(\\\/(\\d+))?`, 'g'),
    () => 'ring-[var(--secondary-dim)]');

  // Gradients
  const grad = (m, p, c, sh) => COOLS.has(c)
    ? `${p}-[var(--accent)]`
    : `${p}-[var(--secondary)]`;
  const WARMS = new Set(['amber', 'yellow', 'orange']);
  const COOLS = new Set(['blue', 'sky', 'cyan', 'teal', 'emerald', 'green', 'lime', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'red']);
  src = src.replace(new RegExp(`(from|via|to)-(${COOL}|${WARM})-(${SHADE})(\\\/\\d+)?`, 'g'), grad);

  // SVG fills / strokes / shadows / accent-color utilities
  src = src.replace(new RegExp(`(fill|stroke|shadow|accent)-(${COOL}|${WARM})-(${SHADE})(\\\/\\d+)?`, 'g'),
    (m, u, c, sh) => WARMS.has(c) ? `${u}-[var(--secondary)]` : `${u}-[var(--accent)]`);

  if (src !== before) {
    fs.writeFileSync(file, src);
    totalChanges++;
    fileReport.push(rel);
  }
}

console.log(`Files modified: ${totalChanges}`);
fileReport.forEach(f => console.log(`  ${f}`));
