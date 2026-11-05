const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 1600;

export type CompressResult = { blob: Blob } | { error: 'tooBig' | 'unreadable' };

/**
 * Réduit la photo dans le navigateur avant l'envoi : moins de données sur réseau mobile,
 * et le corps reste sous la limite des fonctions Vercel. Le serveur revérifie et réencode tout.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  if (file.size > MAX_SOURCE_BYTES) return { error: 'tooBig' };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return { error: 'unreadable' };
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return blob ? { blob } : { error: 'unreadable' };
  } catch (error) {
    console.warn('[menu] photo illisible dans le navigateur', error);
    return { error: 'unreadable' };
  }
}
