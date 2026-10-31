// Shared bearer-token check for Vercel Cron-triggered routes.
// Cron requests carry no session cookie, so they authenticate via CRON_SECRET
// instead of requireApiRole.
export function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
