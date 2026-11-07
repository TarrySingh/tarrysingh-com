const fs = require('node:fs');
const source = fs.readFileSync(process.argv[2] || `${__dirname}/app.js`, 'utf8');
for (const name of ['exerciseVisuals', 'exerciseSecondVisuals']) {
  const match = source.match(new RegExp(`const ${name}=({[\\s\\S]*?});`));
  if (!match) throw new Error(`Cannot locate ${name}`);
  const seen = new Set();
  const duplicates = new Set();
  const property = /(?:'([^']+)'|"([^"]+)"|([\w$]+))\s*:\s*(?:'[^']*'|"[^"]*")/g;
  for (const entry of match[1].matchAll(property)) {
    const key = entry[1] || entry[2] || entry[3];
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  if (match[1].replace(property, '').replace(/[{},\s]/g, '')) throw new Error(`${name} contains an unsupported entry`);
  if (!seen.size || duplicates.size) throw new Error(`${name} has duplicate keys: ${[...duplicates].join(', ')}`);
}
