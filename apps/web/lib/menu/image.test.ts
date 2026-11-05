import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { InvalidImageError, MAX_UPLOAD_BYTES, processDishImage } from './image';

const png = (width: number, height: number) => sharp({ create: { width, height, channels: 3, background: '#C7FF2E' } }).png().toBuffer();

describe('processDishImage', () => {
  it('produit deux WebP carrés sans métadonnées', async () => {
    const source = await sharp(await png(1200, 600)).withMetadata({ exif: { IFD0: { Copyright: 'secret' } } }).jpeg().toBuffer();
    const { full, thumb } = await processDishImage(source);
    const meta = await sharp(full).metadata();
    expect(meta).toMatchObject({ format: 'webp', width: 800, height: 800 });
    expect(meta.exif).toBeUndefined();
    expect(await sharp(thumb).metadata()).toMatchObject({ format: 'webp', width: 240, height: 240 });
  });

  it('refuse un fichier qui n’est pas une image autorisée', async () => {
    await expect(processDishImage(Buffer.from('<script>alert(1)</script>'))).rejects.toBeInstanceOf(InvalidImageError);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    await expect(processDishImage(svg)).rejects.toBeInstanceOf(InvalidImageError);
    const gif = await sharp(await png(10, 10)).gif().toBuffer();
    await expect(processDishImage(gif)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it('refuse un fichier vide ou trop lourd', async () => {
    await expect(processDishImage(Buffer.alloc(0))).rejects.toBeInstanceOf(InvalidImageError);
    await expect(processDishImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toBeInstanceOf(InvalidImageError);
  });
});
