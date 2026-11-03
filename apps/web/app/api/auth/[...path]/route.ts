import { auth } from '@/lib/auth/server';
import { isBlockedAuthPath } from '@/lib/auth/blocked-paths';

const upstream = auth.handler();
type Handler = (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;

// Le proxy Neon Auth expose toutes les routes Better Auth : on coupe celles que Restio n'utilise pas.
function guard(handler: Handler): Handler {
  return async (request, context) => {
    const { path } = await context.params;
    if (isBlockedAuthPath(path.join('/'))) return new Response(null, { status: 404 });
    return handler(request, context);
  };
}

export const GET = guard(upstream.GET as Handler);
export const POST = guard(upstream.POST as Handler);
export const PUT = guard(upstream.PUT as Handler);
export const PATCH = guard(upstream.PATCH as Handler);
export const DELETE = guard(upstream.DELETE as Handler);
