import { PDFDocument, rgb, StandardFonts, type PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { LOGO_DATA_URI } from './logo';

// Correction maximale (H, 30 %) : le logo au centre ne gêne pas la lecture, même sur un support abîmé.
export function qrModules(text: string): { size: number; dark: (x: number, y: number) => boolean } {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  return { size: modules.size, dark: (x, y) => modules.get(y, x) === 1 };
}

const QUIET = 2;
export const LOGO_RATIO = 0.22;

/** Tracé SVG des modules, sans la zone centrale réservée au logo. Coordonnées en modules, marge comprise. */
export function qrPath(text: string): { viewBox: number; d: string; logo: { x: number; size: number } } {
  const { size, dark } = qrModules(text);
  const logoSize = Math.ceil(size * LOGO_RATIO) | 1;
  const start = Math.floor((size - logoSize) / 2);
  let d = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inLogo = x >= start && x < start + logoSize && y >= start && y < start + logoSize;
      if (dark(x, y) && !inLogo) d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
    }
  }
  return { viewBox: size + QUIET * 2, d, logo: { x: start + QUIET, size: logoSize } };
}

export async function qrPng(text: string, px = 1200): Promise<Buffer> {
  const { viewBox, d, logo } = qrPath(text);
  const pad = logo.size * 0.12;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${px}" height="${px}" viewBox="0 0 ${viewBox} ${viewBox}"><rect width="${viewBox}" height="${viewBox}" fill="#fff"/><path d="${d}" fill="#0F0F0F"/><image x="${logo.x + pad}" y="${logo.x + pad}" width="${logo.size - pad * 2}" height="${logo.size - pad * 2}" xlink:href="${LOGO_DATA_URI}"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export type SupportKind = 'tent' | 'sticker' | 'poster';
export type SupportPage = { url: string; label: string };

const MM = 72 / 25.4;
const SIZES: Record<SupportKind, [number, number]> = { tent: [105 * MM, 148 * MM], sticker: [80 * MM, 80 * MM], poster: [210 * MM, 297 * MM] };
const INK = rgb(15 / 255, 15 / 255, 15 / 255);
const LIME = rgb(199 / 255, 1, 46 / 255);
const WHITE = rgb(1, 1, 1);
const GRAY = rgb(0.64, 0.64, 0.63);

// Les polices standard du PDF ne couvrent que WinAnsi : un caractère hors jeu est retiré plutôt que de faire échouer le fichier.
const printable = (font: PDFFont, text: string) => [...text].filter((c) => {
  try {
    font.encodeText(c);
    return true;
  } catch {
    return false;
  }
}).join('');

function centered(page: ReturnType<PDFDocument['addPage']>, font: PDFFont, raw: string, y: number, size: number, color: ReturnType<typeof rgb>) {
  const text = printable(font, raw);
  const width = font.widthOfTextAtSize(text, size);
  const scale = width > page.getWidth() - 24 ? (page.getWidth() - 24) / width : 1;
  page.drawText(text, { x: (page.getWidth() - width * scale) / 2, y, size: size * scale, font, color });
}

/** Supports de la planche : chevalet A6 et autocollant noirs, affiche A4 blanche. Une page par table. */
export async function supportPdf(kind: SupportKind, pages: SupportPage[], cta: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const [width, height] = SIZES[kind];
  const dark = kind !== 'poster';
  for (const item of pages) {
    const page = pdf.addPage([width, height]);
    if (dark) page.drawRectangle({ x: 0, y: 0, width, height, color: INK });
    const qrSide = width * (kind === 'sticker' ? 0.62 : 0.7);
    const image = await pdf.embedPng(await qrPng(item.url, 1000));
    const x = (width - qrSide) / 2;
    const y = height - qrSide - height * 0.14;
    page.drawRectangle({ x: x - 6, y: y - 6, width: qrSide + 12, height: qrSide + 12, color: WHITE });
    page.drawImage(image, { x, y, width: qrSide, height: qrSide });
    const unit = kind === 'poster' ? 2.1 : kind === 'tent' ? 1.15 : 0.85;
    centered(page, bold, cta, y - 26 * unit, 15 * unit, dark ? LIME : INK);
    centered(page, regular, item.label, y - 44 * unit, 11 * unit, dark ? GRAY : INK);
  }
  return pdf.save();
}
