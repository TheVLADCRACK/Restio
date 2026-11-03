import { auth } from '@/lib/auth/server';
import { isAllowedAdminAuthPath } from '@/lib/auth/allowed-paths';

const upstream = auth.handler();
type Handler = (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;

function guard(handler: Handler): Handler {
  return async (request, context) => {
    const { path } = await context.params;
    if (!isAllowedAdminAuthPath(path.join('/'))) return new Response(null, { status: 404 });
    return handler(request, context);
  };
}

export const GET = guard(upstream.GET as Handler);
export const POST = guard(upstream.POST as Handler);
