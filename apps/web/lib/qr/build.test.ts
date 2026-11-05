import jsQR from 'jsqr';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { qrPath, qrPng, supportPdf } from './build';

const URL_WITH_TABLE = 'https://restio-app.com/@le-comptoir-d-awa?table=Terrasse%203';

describe('QR Code', () => {
  it('reste lisible avec le logo au centre', async () => {
    const png = await qrPng(URL_WITH_TABLE, 600);
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    expect(decoded?.data).toBe(URL_WITH_TABLE);
  });

  it('réserve une zone centrale au logo', () => {
    const { viewBox, logo } = qrPath(URL_WITH_TABLE);
    expect(logo.size).toBeGreaterThan(4);
    expect(logo.x + logo.size / 2).toBeCloseTo(viewBox / 2, 0);
  });
});

describe('supports à imprimer', () => {
  it('produit une page par table et tolère les caractères hors WinAnsi', async () => {
    const pages = [
      { url: `${URL_WITH_TABLE}1`, label: 'Table 1' },
      { url: `${URL_WITH_TABLE}2`, label: 'Table 2 飯店' },
    ];
    const bytes = await supportPdf('tent', pages, 'Scannez pour commander');
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(2);
  });
});
