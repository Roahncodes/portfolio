// Extracts plain text from a PDF by inflating its content streams.
//
// Handles the two filters ReportLab emits for page content:
//   /Filter [ /FlateDecode ]                  → inflate
//   /Filter [ /ASCII85Decode /FlateDecode ]   → ascii85, then inflate
//
// Usage: node scripts/extract-resume.mjs "C:/path/to/file.pdf"
import fs from "node:fs";
import zlib from "node:zlib";

const BS = String.fromCharCode(92); // backslash

/** Decode an ASCII85 payload (PDF flavour, terminated by "~>"). */
function ascii85Decode(input) {
  const out = [];
  let group = [];

  for (const ch of input) {
    if (/\s/.test(ch)) continue;
    if (ch === "z" && group.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code < 33 || code > 117) continue;
    group.push(code - 33);

    if (group.length === 5) {
      let value = 0;
      for (const g of group) value = value * 85 + g;
      out.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
      group = [];
    }
  }

  if (group.length > 1) {
    const pad = 5 - group.length;
    while (group.length < 5) group.push(84);
    let value = 0;
    for (const g of group) value = value * 85 + g;
    const bytes = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    out.push(...bytes.slice(0, 4 - pad));
  }

  return Buffer.from(out);
}

/** Collect ( ... ) string literals from a content stream, honouring escapes. */
function readStrings(text) {
  const out = [];

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "(") continue;

    let depth = 1;
    let value = "";
    i++;

    while (i < text.length && depth > 0) {
      const ch = text[i];

      if (ch === BS) {
        const next = text[i + 1];
        if (next === "n") value += "\n";
        else if (next !== "r") value += next;
        i += 2;
        continue;
      }

      if (ch === "(") depth++;
      if (ch === ")") {
        depth--;
        if (depth === 0) break;
      }

      value += ch;
      i++;
    }

    out.push(value);
  }

  return out;
}

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/extract-resume.mjs <file.pdf>");
  process.exit(1);
}

const buf = fs.readFileSync(file);
const raw = buf.toString("latin1");
const chunks = [];

const streamRe = new RegExp("stream\\r?\\n", "g");
let match;

while ((match = streamRe.exec(raw))) {
  const start = match.index + match[0].length;
  const end = raw.indexOf("endstream", start);
  if (end < 0) continue;

  const dict = raw.slice(Math.max(0, match.index - 300), match.index);
  let data = buf.slice(start, end);

  try {
    if (dict.includes("ASCII85Decode")) {
      const text = data.toString("latin1");
      const stop = text.search(/~>/);
      data = ascii85Decode(text.slice(0, stop >= 0 ? stop : undefined));
    }

    const inflated = zlib
      .inflateSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
      .toString("latin1");

    if (inflated.includes("BT") || inflated.includes("Tj") || inflated.includes("TJ")) {
      chunks.push(inflated);
    }
  } catch {
    /* not a decodable content stream — font files, metadata, embedded files */
  }
}

console.log(chunks.map((chunk) => readStrings(chunk).join("")).join("\n"));
