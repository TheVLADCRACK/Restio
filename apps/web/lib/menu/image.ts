import sharp from 'sharp';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const ALLOWED = new Set(['jpeg', 'png', 'webp']);

export class InvalidImageError extends Error {}

/**
 * Vérifie le format réel (pas le type annoncé), limite les pixels décodés et réencode en WebP carré :
 * les métadonnées (GPS, appareil) disparaissent et tout contenu caché dans le fichier d'origine aussi.
 */
export function processDishImage(input: Buffer): Promise<{ full: Buffer; thumb: Buffer }> {
  return processImage(input, { width: 800, height: 800, quality: 80 }, { width: 240, height: 240, quality: 72 });
}

type Variant = { width: number; height: number; quality: number };

export async function processImage(input: Buffer, fullSize: Variant, thumbSize: Variant): Promise<{ full: Buffer; thumb: Buffer }> {
  if (input.byteLength === 0 || input.byteLength > MAX_UPLOAD_BYTES) throw new InvalidImageError('size');
  const open = () => sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error', animated: false });
  try {
    const { format } = await open().metadata();
    if (!format || !ALLOWED.has(format)) throw new InvalidImageError('format');
    const render = ({ width, height, quality }: Variant) => open().rotate().resize(width, height, { fit: 'cover' }).webp({ quality }).toBuffer();
    const [full, thumb] = await Promise.all([render(fullSize), render(thumbSize)]);
    return { full, thumb };
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError('decode');
  }
}
