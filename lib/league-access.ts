/** Pure helpers for league-scoped access decisions. All functions are DB-free. */

/**
 * Sanitize a callbackUrl for use in redirects.
 * Accepts only relative paths to prevent open-redirect attacks.
 * Protocol-relative URLs ("//evil.com") are rejected.
 */
export function sanitizeCallbackUrl(raw: string | undefined): string {
  if (!raw) return "/";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

/**
 * Compute the active league ID for the leaderboard.
 * - Admins: URL param wins; if absent → undefined (show all).
 * - Players: URL param wins; if absent → first league (alphabetical);
 *   if player has no leagues → undefined (caller must guard with isNoLeaguePlayer).
 */
export function getActiveLeagueId(
  paramLeague: string | undefined,
  userLeagues: { id: string }[],
  isAdmin: boolean
): string | undefined {
  if (isAdmin) return paramLeague ?? undefined;
  return paramLeague ?? userLeagues[0]?.id;
}

/**
 * True when the user is a logged-in player who has not joined any league.
 * Used to suppress selections and the "New Selection" button.
 */
export function isNoLeaguePlayer(
  userLeagues: { id: string }[],
  isAdmin: boolean
): boolean {
  return !isAdmin && userLeagues.length === 0;
}

/**
 * Compute the league filter for home-page stats.
 * Returns:
 *   null       → admin or guest: caller should show global totals
 *   string[]   → player: caller should scope to these league IDs
 *                (empty array means "player with no leagues → show 0")
 */
export function getHomeStatsScope(
  userId: string | undefined,
  isAdmin: boolean,
  userLeagueIds: string[]
): string[] | null {
  if (!userId || isAdmin) return null;   // guest or admin → global
  return userLeagueIds;                  // player (possibly empty)
}
