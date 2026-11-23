/** EAN-13 helpers and a pure-SVG barcode renderer (no external libraries, no camera). */

const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

export function ean13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}

export type EanValidation = { ok: true } | { ok: false; reason: string };

export function validateEan13(code: string): EanValidation {
  if (!code) return { ok: false, reason: "Enter the 13-digit number printed under the barcode." };
  if (!/^\d+$/.test(code)) return { ok: false, reason: "Barcodes contain digits only." };
  if (code.length !== 13) return { ok: false, reason: `EAN-13 barcodes have 13 digits — this has ${code.length}.` };
  if (ean13CheckDigit(code.slice(0, 12)) !== Number(code[12])) return { ok: false, reason: "The last (check) digit doesn't match — re-check the number for a typo." };
  return { ok: true };
}

/** 95-module bit pattern for a valid EAN-13. */
function modules(code: string): string {
  const parity = PARITY[Number(code[0])];
  let bits = "101";
  for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === "L" ? L : G)[Number(code[i])];
  bits += "01010";
  for (let i = 7; i <= 12; i++) bits += R[Number(code[i])];
  return bits + "101";
}

const GUARD = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);

export function Barcode({ code, className, showDigits = true }: { code: string; className?: string; showDigits?: boolean }) {
  const valid = /^\d{13}$/.test(code);
  const bits = valid ? modules(code) : "";
  const quiet = 9;
  const width = 95 + quiet * 2;
  return (
    <svg viewBox={`0 0 ${width} ${showDigits ? 62 : 54}`} className={className} role="img" aria-label={valid ? `EAN-13 barcode ${code}` : "Barcode"}>
      <rect width={width} height={showDigits ? 62 : 54} fill="white" rx="2" />
      {bits.split("").map((b, i) =>
        b === "1" ? <rect key={i} x={quiet + i} y={4} width={1} height={GUARD.has(i) ? 50 : 45} fill="#0b1420" /> : null,
      )}
      {showDigits && valid && (
        <g fill="#0b1420" fontSize="7" fontFamily="ui-monospace, monospace" textAnchor="middle">
          <text x={quiet - 4} y={59}>{code[0]}</text>
          <text x={quiet + 3 + 21} y={59} letterSpacing="1.6">{code.slice(1, 7)}</text>
          <text x={quiet + 50 + 21} y={59} letterSpacing="1.6">{code.slice(7)}</text>
        </g>
      )}
    </svg>
  );
}
