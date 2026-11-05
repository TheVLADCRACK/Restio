import 'server-only';
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Bucket public en lecture (photos des menus) ; identifiants et point d'accès lus dans AWS_* par le SDK.
const BUCKET = 'media';
const THUMB_SUFFIX = '-thumb';
export const IMMUTABLE = 'public, max-age=31536000, immutable';

let client: S3Client | undefined;
function s3(): S3Client {
  client ??= new S3Client({ forcePathStyle: true });
  return client;
}

export type MediaVariants = { full: Buffer; thumb: Buffer };

/** Clé générée par le serveur : aucun nom de fichier fourni par l'utilisateur n'est conservé. */
export function dishImageKey(restaurantId: string): string {
  return `restaurants/${restaurantId}/dishes/${crypto.randomUUID()}.webp`;
}

export function restaurantImageKey(restaurantId: string, kind: 'logo' | 'banner'): string {
  return `restaurants/${restaurantId}/${kind}/${crypto.randomUUID()}.webp`;
}

const thumbKey = (key: string) => key.replace(/\.webp$/, `${THUMB_SUFFIX}.webp`);

export async function putMedia(key: string, { full, thumb }: MediaVariants): Promise<void> {
  // Une nouvelle clé par version : le cache navigateur et CDN peut être immuable.
  const put = (Key: string, Body: Buffer) => s3().send(new PutObjectCommand({ Bucket: BUCKET, Key, Body, ContentType: 'image/webp', CacheControl: IMMUTABLE }));
  await Promise.all([put(key, full), put(thumbKey(key), thumb)]);
}

/** Suppression différée : un échec laisse un fichier orphelin mais ne casse pas l'action. */
export async function deleteMedia(key: string): Promise<void> {
  try {
    await s3().send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: [{ Key: key }, { Key: thumbKey(key) }], Quiet: true } }));
  } catch (error) {
    console.error(`[storage] delete failed: ${error instanceof Error ? error.name : 'unknown'}`);
  }
}

export function mediaUrls(key: string): { full: string; thumb: string } {
  const base = `${process.env.AWS_ENDPOINT_URL_S3 ?? ''}/${BUCKET}`;
  return { full: `${base}/${key}`, thumb: `${base}/${thumbKey(key)}` };
}
