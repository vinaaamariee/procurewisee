const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

let fixed = 0;
for (const f of walk(path.join(__dirname, "..", "src"))) {
  let c = fs.readFileSync(f, "utf8");
  const o = c;
  // Quote unquoted var(--secondary-strong) object values (pass-2 dropped quotes)
  c = c.replace(/(?<!['"a-zA-Z])var\(--secondary-strong\)(?!['"])/g, "'var(--secondary-strong)'");
  // Nonexistent legacy token -> secondary-dim
  c = c.split("var(--green-dim)").join("var(--secondary-dim)");
  if (c !== o) { fs.writeFileSync(f, c); fixed++; console.log("fixed:", path.relative(process.cwd(), f)); }
}
console.log(`total files fixed: ${fixed}`);
