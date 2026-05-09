export function shortNote(note: string): string {
  return note
    .replace(/Winner Group ([A-L])/g,    (_, g) => `${g}1`)
    .replace(/Runner-up Group ([A-L])/g, (_, g) => `${g}2`)
    .replace(/3rd Place Group ([A-L/]+)/g, (_, g) => `3rd ${g}`)
    .replace(/Winner Match (\d+)/g,      (_, n) => `W${n}`)
    .replace(/Loser Match (\d+)/g,       (_, n) => `L${n}`);
}
