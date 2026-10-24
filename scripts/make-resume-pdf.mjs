/**
 * Wrap a full-page PNG render of a document into a real, single-page A4 PDF.
 *
 * Why this exists: the site offers the resume as a download, and a PNG is not
 * what you attach to a job application. The render is the only copy that
 * survives on this machine, so instead of inventing a document this script
 * re-containers the exact same pixels — no text is re-typeset, nothing is
 * reflowed, the page looks identical to the image.
 *
 * It is a from-scratch PNG reader (palette / greyscale / truecolour, 8-bit,
 * non-interlaced) plus a minimal PDF writer. Everything is deflated with the
 * same zlib the PNG already uses, so the PDF needs no extra dependency and no
 * JPEG re-encoding (which would visibly soften the glyph edges).
 *
 * Usage:
 *   node scripts/make-resume-pdf.mjs <input.png> <output.pdf> [title]
 */

import { deflateSync, inflateSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const PNG_SIGNATURE = "89504e470d0a1a0a";

function fail(message) {
  console.error(`make-resume-pdf: ${message}`);
  process.exit(1);
}

/* ── read the PNG ─────────────────────────────────────────────────────────── */

function decodePng(buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    fail("not a PNG file");
  }

  let offset = 8;
  let header = null;
  let palette = null;
  const dataChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      header = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        bitDepth: body[8],
        colourType: body[9],
        interlace: body[12],
      };
    } else if (type === "PLTE") {
      palette = body;
    } else if (type === "IDAT") {
      dataChunks.push(body);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (!header) fail("no IHDR chunk");
  if (header.bitDepth !== 8) fail(`unsupported bit depth ${header.bitDepth} (need 8)`);
  if (header.interlace !== 0) fail("interlaced PNGs are not supported");

  const channels =
    header.colourType === 0 ? 1 : header.colourType === 2 ? 3 : header.colourType === 3 ? 1 : header.colourType === 6 ? 4 : 0;

  if (channels === 0) fail(`unsupported colour type ${header.colourType}`);
  if (header.colourType === 3 && !palette) fail("palette image without a PLTE chunk");
  if (palette && palette.length % 3 !== 0) fail("malformed PLTE chunk");

  const { width, height } = header;
  const raw = inflateSync(Buffer.concat(dataChunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);

  // Undo the per-scanline filters (PNG spec §9.2).
  let cursor = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;

    const line = raw.subarray(cursor, cursor + stride);
    cursor += stride;

    const target = pixels.subarray(y * stride, (y + 1) * stride);
    const previous = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? target[x - channels] : 0;
      const b = previous ? previous[x] : 0;
      const c = previous && x >= channels ? previous[x - channels] : 0;
      const value = line[x];

      let restored;
      switch (filter) {
        case 0:
          restored = value;
          break;
        case 1:
          restored = value + a;
          break;
        case 2:
          restored = value + b;
          break;
        case 3:
          restored = value + ((a + b) >> 1);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          restored = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          fail(`unknown scanline filter ${filter} on row ${y}`);
      }

      target[x] = restored & 0xff;
    }
  }

  // Expand to RGB.
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i += 1) {
    let r;
    let g;
    let b;

    if (header.colourType === 3) {
      const entry = pixels[i] * 3;
      r = palette[entry];
      g = palette[entry + 1];
      b = palette[entry + 2];
    } else if (header.colourType === 0) {
      r = g = b = pixels[i];
    } else {
      const at = i * channels;
      r = pixels[at];
      g = pixels[at + 1];
      b = pixels[at + 2];
    }

    const at = i * 3;
    rgb[at] = r;
    rgb[at + 1] = g;
    rgb[at + 2] = b;
  }

  return { width, height, rgb };
}

/* ── write the PDF ────────────────────────────────────────────────────────── */

function escapeText(value) {
  return value.replace(/([\\()])/g, "\\$1").replace(/[^\x20-\x7e]/g, "");
}

const OBJECT_COUNT = 6;

function buildPdf({ width, height, rgb }, title) {
  // A4 in PostScript points.
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const image = deflateSync(rgb, { level: 9 });
  const created = new Date();
  const stamp = `D:${created.getFullYear()}${String(created.getMonth() + 1).padStart(2, "0")}${String(
    created.getDate(),
  ).padStart(2, "0")}${String(created.getHours()).padStart(2, "0")}${String(created.getMinutes()).padStart(
    2,
    "0",
  )}${String(created.getSeconds()).padStart(2, "0")}`;

  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;

  const chunks = [];
  const offsets = [];
  let position = 0;

  const push = (buffer) => {
    chunks.push(buffer);
    position += buffer.length;
  };
  const text = (value) => push(Buffer.from(value, "latin1"));
  const open = (number) => {
    offsets[number] = position;
    text(`${number} 0 obj\n`);
  };
  const close = () => text("endobj\n");

  text("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");

  open(1);
  text("<< /Type /Catalog /Pages 2 0 R >>\n");
  close();

  open(2);
  text("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
  close();

  open(3);
  text(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\n`,
  );
  close();

  open(4);
  text(
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${image.length} >>\nstream\n`,
  );
  push(image);
  text("\nendstream\n");
  close();

  open(5);
  text(`<< /Length ${content.length} >>\nstream\n${content}endstream\n`);
  close();

  open(6);
  text(
    `<< /Title (${escapeText(title)}) /Producer (on repeat. - scripts/make-resume-pdf.mjs) /CreationDate (${stamp}) >>\n`,
  );
  close();

  const xrefStart = position;
  const rows = ["xref\n", `0 ${OBJECT_COUNT + 1}\n`, "0000000000 65535 f \n"];
  for (let number = 1; number <= OBJECT_COUNT; number += 1) {
    rows.push(`${String(offsets[number]).padStart(10, "0")} 00000 n \n`);
  }

  text(
    `${rows.join("")}trailer\n<< /Size ${OBJECT_COUNT + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );

  return Buffer.concat(chunks);
}

/* ── main ─────────────────────────────────────────────────────────────────── */

const [input, output, title = "Resume"] = process.argv.slice(2);

if (!input || !output) {
  fail("usage: node scripts/make-resume-pdf.mjs <input.png> <output.pdf> [title]");
}

const decoded = decodePng(readFileSync(input));
const pdf = buildPdf(decoded, title || basename(output));

writeFileSync(output, pdf);

console.log(
  `${input} → ${output}\n  page    ${decoded.width}×${decoded.height}px on A4\n  pdf     ${(
    pdf.length / 1024
  ).toFixed(0)} KiB`,
);
