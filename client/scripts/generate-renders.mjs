/**
 * Generates consistent studio-style product renders (SVG) for every catalog item.
 * Run with: node scripts/generate-renders.mjs   (Node 22.6+ with TypeScript type stripping)
 *
 * Product photography for invented brands does not exist, so each product receives a
 * deterministic illustrated render that reflects its real type, finish, size and features.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fridgeRows, washerRows, tvRows, laptopRows } from "../src/data/products/catalog-specs.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images", "products");
mkdirSync(outDir, { recursive: true });

const FIN = {
  stainless: { a: "#F2F5F7", b: "#CDD4DA", c: "#E3E8EC", edge: "#A9B3BC", side: "#B7C0C8", handleA: "#8F9AA4", handleB: "#EEF1F3", brushed: true },
  black: { a: "#4A5059", b: "#2A2F36", c: "#3A4048", edge: "#1C2025", side: "#22262C", handleA: "#15181C", handleB: "#5C636D", brushed: true },
  white: { a: "#FFFFFF", b: "#E8ECEF", c: "#F6F8F9", edge: "#CDD5DB", side: "#DCE2E6", handleA: "#BCC5CC", handleB: "#F4F6F8", brushed: false },
  graphite: { a: "#6A737D", b: "#434A52", c: "#585F68", edge: "#30363C", side: "#3A4047", handleA: "#2A2F35", handleB: "#7D8691", brushed: true },
  sage: { a: "#C8D5C2", b: "#9FB298", c: "#B5C5AE", edge: "#869A80", side: "#93A68C", handleA: "#D9DDD6", handleB: "#F4F5F2", brushed: false },
  navy: { a: "#3A5272", b: "#1C2C42", c: "#2C4060", edge: "#142133", side: "#192840", handleA: "#B9A77E", handleB: "#E6D9B5", brushed: false },
  cream: { a: "#FAF3E6", b: "#E3D5BD", c: "#F0E5D2", edge: "#CDBB9D", side: "#D8C9AE", handleA: "#B8A27A", handleB: "#EADCB8", brushed: false },
  silver: { a: "#E6EAED", b: "#B8C0C7", c: "#D2D8DD", edge: "#9EA8B1", side: "#AAB3BB", handleA: "#8A949D", handleB: "#E9ECEF", brushed: true },
  panel: { a: "#E9E1D5", b: "#CFC2AE", c: "#DED3C3", edge: "#B9AA94", side: "#C6B8A3", handleA: "#7E7367", handleB: "#A99C8C", brushed: false },
};

function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

const S = 800;

function frame(inner, defs, shadow) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
${defs}
</defs>
<ellipse cx="${shadow.cx}" cy="${shadow.cy}" rx="${shadow.rx}" ry="${shadow.ry}" fill="#0B1420" opacity="0.22" filter="url(#blur)"/>
${inner}
</svg>`;
}

function bodyDefs(f, id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.15">
<stop offset="0" stop-color="${f.a}"/><stop offset="0.55" stop-color="${f.c}"/><stop offset="1" stop-color="${f.b}"/></linearGradient>
<linearGradient id="${id}-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${f.handleA}"/><stop offset="0.5" stop-color="${f.handleB}"/><stop offset="1" stop-color="${f.handleA}"/></linearGradient>
<linearGradient id="${id}-hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.handleB}"/><stop offset="1" stop-color="${f.handleA}"/></linearGradient>
<linearGradient id="${id}-gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.18" stop-color="#fff" stop-opacity="0.38"/><stop offset="0.32" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="${id}-brush" width="6" height="800" patternUnits="userSpaceOnUse"><rect width="6" height="800" fill="none"/><line x1="1" y1="0" x2="1" y2="800" stroke="#fff" stroke-opacity="0.07"/><line x1="4" y1="0" x2="4" y2="800" stroke="#000" stroke-opacity="0.025"/></pattern>`;
}

function panel(x, y, w, h, f, id, r = 6) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id})" stroke="${f.edge}" stroke-width="1.5"/>
${f.brushed ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id}-brush)"/>` : ""}
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id}-gloss)"/>`;
}
const vHandle = (x, y, h, id) => `<rect x="${x}" y="${y}" width="9" height="${h}" rx="4.5" fill="url(#${id}-h)"/><rect x="${x + 1}" y="${y}" width="2" height="${h}" rx="1" fill="#fff" opacity="0.35"/>`;
const hHandle = (x, y, w, id) => `<rect x="${x}" y="${y}" width="${w}" height="9" rx="4.5" fill="url(#${id}-hh)"/>`;

function fridge(row) {
  const [key, , , , type, finish, , , wMm, hMm, dMm, , , , , , , , , , features] = row;
  const f = FIN[finish];
  const id = "g";
  const maxH = 640;
  const scale = Math.min(maxH / 2130, 1) * (type === "Compact" ? 1.9 : 1);
  let h = hMm * (maxH / 2130) * (type === "Compact" ? 1.6 : 1.12);
  h = Math.min(h, 660);
  let w = (wMm / hMm) * h;
  const sideW = Math.max(14, (dMm / hMm) * h * 0.16);
  const x = (S - w - sideW) / 2;
  const y = 720 - h;
  void scale;
  const gap = 3;
  const has = (c) => features.includes(c);
  let parts = "";
  // side panel for depth
  parts += `<path d="M${x + w} ${y + 6} L${x + w + sideW} ${y + 14} L${x + w + sideW} ${y + h - 4} L${x + w} ${y + h} Z" fill="${f.side}" stroke="${f.edge}" stroke-width="1"/>`;
  parts += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${f.edge}"/>`;
  const display = (dx, dy) => has("S") || has("W") ? `<rect x="${dx}" y="${dy}" width="46" height="16" rx="4" fill="#0E1621" opacity="0.92"/><circle cx="${dx + 10}" cy="${dy + 8}" r="2.4" fill="#43D5C2"/><rect x="${dx + 17}" y="${dy + 6}" width="22" height="4" rx="2" fill="#43D5C2" opacity="0.65"/>` : "";
  const dispenser = (dx, dy, dw) => has("W") ? `<rect x="${dx}" y="${dy}" width="${dw}" height="${dw * 1.35}" rx="8" fill="#141B24" opacity="0.9"/><rect x="${dx + 6}" y="${dy + 6}" width="${dw - 12}" height="10" rx="3" fill="#2A3644"/><circle cx="${dx + dw / 2}" cy="${dy + 11}" r="2" fill="#43D5C2"/><rect x="${dx + dw * 0.3}" y="${dy + 24}" width="${dw * 0.4}" height="${dw * 0.55}" rx="4" fill="#0B1118"/>` : "";
  if (type === "French door" || type === "Counter-depth" || type === "Four-door") {
    const topH = h * (type === "Four-door" ? 0.56 : 0.62);
    const half = (w - gap) / 2;
    parts += panel(x, y, half, topH, f, id) + panel(x + half + gap, y, half, topH, f, id);
    parts += vHandle(x + half - 18, y + topH * 0.12, topH * 0.7, id) + vHandle(x + half + gap + 9, y + topH * 0.12, topH * 0.7, id);
    parts += dispenser(x + half * 0.22, y + topH * 0.3, half * 0.42);
    parts += display(x + half + gap + half * 0.55, y + 22);
    if (type === "Four-door") {
      const bh = h - topH - gap;
      parts += panel(x, y + topH + gap, half, bh, f, id) + panel(x + half + gap, y + topH + gap, half, bh, f, id);
      parts += vHandle(x + half - 18, y + topH + gap + bh * 0.12, bh * 0.6, id) + vHandle(x + half + gap + 9, y + topH + gap + bh * 0.12, bh * 0.6, id);
    } else {
      const bh = h - topH - gap;
      parts += panel(x, y + topH + gap, w, bh, f, id);
      parts += hHandle(x + w * 0.2, y + topH + gap + 14, w * 0.6, id);
    }
  } else if (type === "Side-by-side") {
    const lw = w * 0.45;
    parts += panel(x, y, lw, h, f, id) + panel(x + lw + gap, y, w - lw - gap, h, f, id);
    parts += vHandle(x + lw - 18, y + h * 0.14, h * 0.62, id) + vHandle(x + lw + gap + 9, y + h * 0.14, h * 0.62, id);
    parts += dispenser(x + lw * 0.2, y + h * 0.22, lw * 0.5);
    parts += display(x + lw + gap + (w - lw) * 0.45, y + 24);
  } else if (type === "Bottom freezer") {
    const topH = h * 0.64;
    parts += panel(x, y, w, topH, f, id) + panel(x, y + topH + gap, w, h - topH - gap, f, id);
    parts += vHandle(x + w - 26, y + topH * 0.35, topH * 0.55, id) + hHandle(x + w * 0.18, y + topH + gap + 14, w * 0.64, id);
    parts += display(x + w * 0.5 - 23, y + 22);
    if (finish === "cream" || finish === "sage") {
      parts += `<rect x="${x + w / 2 - 22}" y="${y + topH * 0.08}" width="44" height="8" rx="4" fill="${f.handleA}" opacity="0.8"/>`;
    }
  } else if (type === "Top freezer") {
    const topH = h * 0.3;
    parts += panel(x, y, w, topH, f, id) + panel(x, y + topH + gap, w, h - topH - gap, f, id);
    parts += vHandle(x + 14, y + topH * 0.35, topH * 0.55, id) + vHandle(x + 14, y + topH + gap + 18, (h - topH) * 0.35, id);
  } else {
    // Column / Compact — single door
    parts += panel(x, y, w, h, f, id);
    parts += vHandle(x + w - 26, y + h * (type === "Compact" ? 0.18 : 0.25), h * (type === "Compact" ? 0.6 : 0.5), id);
    if (type === "Column") parts += display(x + w * 0.5 - 23, y + 24);
  }
  // kick plate / feet
  parts += `<rect x="${x + 10}" y="${y + h - 2}" width="${w - 20}" height="10" rx="3" fill="#1A222C" opacity="0.65"/>`;
  void key;
  return frame(parts, bodyDefs(f, id), { cx: x + w / 2 + sideW / 2, cy: 728, rx: w * 0.62, ry: 16 });
}

function washer(row) {
  const [, , , , type, finish] = row;
  const f = FIN[finish];
  const id = "g";
  const top = type === "Top load";
  const w = top ? 420 : 400;
  const h = top ? 540 : 520;
  const x = (S - w - 26) / 2;
  const y = 720 - h;
  let p = `<path d="M${x + w} ${y + 6} L${x + w + 26} ${y + 16} L${x + w + 26} ${y + h - 4} L${x + w} ${y + h} Z" fill="${f.side}" stroke="${f.edge}"/>`;
  if (top) {
    p += panel(x, y - 64, w, 70, f, id, 10);
    p += `<rect x="${x + 40}" y="${y - 44}" width="120" height="26" rx="6" fill="#0E1621"/><rect x="${x + 52}" y="${y - 36}" width="58" height="10" rx="3" fill="#43D5C2" opacity="0.75"/><circle cx="${x + w - 80}" cy="${y - 30}" r="22" fill="url(#${id}-h)" stroke="${f.edge}"/>`;
    p += panel(x, y, w, h, f, id, 10);
    p += `<rect x="${x + 18}" y="${y + 14}" width="${w - 36}" height="10" rx="5" fill="${f.edge}" opacity="0.55"/>`;
  } else {
    p += panel(x, y, w, h, f, id, 14);
    p += `<line x1="${x}" y1="${y + 88}" x2="${x + w}" y2="${y + 88}" stroke="${f.edge}" stroke-width="1.5"/>`;
    p += `<rect x="${x + 18}" y="${y + 22}" width="110" height="44" rx="6" fill="${f.b}" stroke="${f.edge}"/><rect x="${x + 28}" y="${y + 40}" width="40" height="6" rx="3" fill="${f.edge}"/>`;
    p += `<rect x="${x + 170}" y="${y + 28}" width="110" height="32" rx="6" fill="#0E1621"/><text x="${x + 190}" y="${y + 50}" font-family="monospace" font-size="16" fill="#43D5C2">1:${type === "Washer-dryer" ? "52" : "18"}</text>`;
    p += `<circle cx="${x + w - 58}" cy="${y + 44}" r="24" fill="url(#${id}-h)" stroke="${f.edge}"/><circle cx="${x + w - 58}" cy="${y + 44}" r="4" fill="${f.handleA}"/>`;
    const cx = x + w / 2, cy = y + 300, r = 150;
    p += `<circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="${f.b}" stroke="${f.edge}" stroke-width="2"/>`;
    p += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ring)"/>`;
    p += `<circle cx="${cx}" cy="${cy}" r="${r - 26}" fill="url(#glass)"/>`;
    p += `<path d="M${cx - r * 0.55} ${cy - r * 0.35} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx + r * 0.05} ${cy - r * 0.68}" stroke="#fff" stroke-opacity="0.45" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    p += `<rect x="${cx + r - 8}" y="${cy - 30}" width="14" height="60" rx="6" fill="${f.handleA}"/>`;
  }
  p += `<rect x="${x + 12}" y="${y + h - 4}" width="${w - 24}" height="10" rx="3" fill="#1A222C" opacity="0.6"/>`;
  const defs = bodyDefs(f, id) + `<radialGradient id="ring" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#F7F9FA"/><stop offset="0.7" stop-color="#AEB8C1"/><stop offset="1" stop-color="#6E7A85"/></radialGradient>
<radialGradient id="glass" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#4A6B86"/><stop offset="0.6" stop-color="#1D2E40"/><stop offset="1" stop-color="#0D1621"/></radialGradient>`;
  return frame(p, defs, { cx: S / 2, cy: 728, rx: w * 0.6, ry: 16 });
}

const PALETTES = [
  ["#0E9F91", "#43D5C2", "#1B3557"], ["#5A3E9E", "#E0679A", "#101C2C"], ["#1D6FB8", "#7CD3F7", "#0B1420"],
  ["#D9772B", "#F5C26B", "#2A1A3E"], ["#2F7D5B", "#B6DB70", "#0F2A2A"], ["#B5482F", "#F29E6B", "#1E1A2E"],
];

function tv(row, idx) {
  const [, , , , type, inches] = row;
  const pal = PALETTES[idx % PALETTES.length];
  const w = 440 + (inches - 50) * 10.5;
  const h = w * 0.5625;
  const x = (S - w) / 2;
  const y = 380 - h / 2;
  const bezel = type === "LED" ? 12 : 6;
  let p = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#0A0D12"/>`;
  p += `<rect x="${x + bezel}" y="${y + bezel}" width="${w - bezel * 2}" height="${h - bezel * 2}" rx="3" fill="url(#scr)"/>`;
  p += `<path d="M${x + bezel} ${y + h * 0.72} C ${x + w * 0.3} ${y + h * 0.42}, ${x + w * 0.55} ${y + h * 0.95}, ${x + w - bezel} ${y + h * 0.5} L ${x + w - bezel} ${y + h - bezel} L ${x + bezel} ${y + h - bezel} Z" fill="${pal[2]}" opacity="0.55"/>`;
  p += `<circle cx="${x + w * 0.7}" cy="${y + h * 0.33}" r="${h * 0.16}" fill="${pal[1]}" opacity="0.55" filter="url(#blur)"/>`;
  p += `<rect x="${x + bezel}" y="${y + bezel}" width="${(w - bezel * 2) * 0.45}" height="${h - bezel * 2}" fill="url(#sheen)"/>`;
  const sy = y + h;
  if (type === "OLED" || type === "Mini-LED") {
    p += `<rect x="${S / 2 - 90}" y="${sy + 70}" width="180" height="12" rx="6" fill="#20262E"/><rect x="${S / 2 - 16}" y="${sy}" width="32" height="74" fill="#2B323B"/>`;
  } else {
    p += `<path d="M${x + w * 0.12} ${sy} l -26 82 h 14 l 30 -82 Z" fill="#2B323B"/><path d="M${x + w * 0.88} ${sy} l 26 82 h -14 l -30 -82 Z" fill="#2B323B"/>`;
  }
  const defs = `<linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[2]}"/><stop offset="0.55" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  return frame(p, defs, { cx: S / 2, cy: sy + 92, rx: w * 0.42, ry: 12 });
}

function laptop(row, idx) {
  const [, , , , type, finish, , screenIn] = row;
  const f = FIN[finish];
  const pal = PALETTES[(idx + 2) % PALETTES.length];
  const w = 420 + (screenIn - 13) * 26;
  const h = w * 0.64;
  const x = (S - w) / 2;
  const y = 470 - h;
  let p = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${f.b}" stroke="${f.edge}"/>`;
  p += `<rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 30}" rx="5" fill="#06090D"/>`;
  p += `<rect x="${x + 18}" y="${y + 18}" width="${w - 36}" height="${h - 42}" rx="3" fill="url(#scr)"/>`;
  p += `<circle cx="${x + w * 0.3}" cy="${y + h * 0.45}" r="${h * 0.22}" fill="${pal[1]}" opacity="0.5" filter="url(#blur)"/>`;
  const by = y + h;
  const dw = w * 1.14;
  p += `<path d="M${x} ${by} L${x + w} ${by} L${S / 2 + dw / 2} ${by + 92} L${S / 2 - dw / 2} ${by + 92} Z" fill="url(#deck)" stroke="${f.edge}"/>`;
  for (let r = 0; r < 4; r++) {
    const t = (r + 0.6) / 5.4;
    const ky = by + 8 + t * 58;
    const kx0 = x - (dw - w) / 2 * t + 26;
    const kw = w + (dw - w) * t - 52;
    p += `<rect x="${kx0}" y="${ky}" width="${kw}" height="${8 + r}" rx="2" fill="${f.edge}" opacity="${type === "Gaming" ? 0.9 : 0.55}"/>`;
    if (type === "Gaming") p += `<rect x="${kx0}" y="${ky + 4 + r}" width="${kw}" height="2" fill="#E0679A" opacity="0.5"/>`;
  }
  p += `<rect x="${S / 2 - w * 0.17}" y="${by + 70}" width="${w * 0.34}" height="16" rx="3" fill="${f.c}" stroke="${f.edge}" opacity="0.9"/>`;
  p += `<rect x="${S / 2 - dw / 2}" y="${by + 92}" width="${dw}" height="8" rx="4" fill="${f.side}"/>`;
  const defs = `<linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[2]}"/><stop offset="0.6" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient>
<linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.c}"/><stop offset="1" stop-color="${f.a}"/></linearGradient>`;
  return frame(p, defs, { cx: S / 2, cy: by + 104, rx: dw * 0.5, ry: 12 });
}

let count = 0;
for (const r of fridgeRows) { writeFileSync(join(outDir, `${r[0]}.svg`), fridge(r)); count++; }
for (const r of washerRows) { writeFileSync(join(outDir, `${r[0]}.svg`), washer(r)); count++; }
tvRows.forEach((r, i) => { writeFileSync(join(outDir, `${r[0]}.svg`), tv(r, i + hash(r[0]) % 3)); count++; });
laptopRows.forEach((r, i) => { writeFileSync(join(outDir, `${r[0]}.svg`), laptop(r, i)); count++; });
console.log(`Generated ${count} renders in ${outDir}`);
