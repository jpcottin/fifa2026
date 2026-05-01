export function splitMatchCounts(winners: string[]): { played: number; upcoming: number } {
  let played = 0;
  let upcoming = 0;
  for (const w of winners) {
    if (w === "UPCOMING") upcoming++;
    else played++;
  }
  return { played, upcoming };
}
