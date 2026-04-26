export interface TeamDef {
  name: string;
  flagEmoji: string;
  set: number;
}

export const SETS: { set: number; label: string; teams: TeamDef[] }[] = [
  {
    set: 1,
    label: "Set 1",
    teams: [
      { name: "France", flagEmoji: "🇫🇷", set: 1 },
      { name: "Spain", flagEmoji: "🇪🇸", set: 1 },
      { name: "Argentina", flagEmoji: "🇦🇷", set: 1 },
      { name: "England", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", set: 1 },
      { name: "Portugal", flagEmoji: "🇵🇹", set: 1 },
      { name: "Brazil", flagEmoji: "🇧🇷", set: 1 },
    ],
  },
  {
    set: 2,
    label: "Set 2",
    teams: [
      { name: "Netherlands", flagEmoji: "🇳🇱", set: 2 },
      { name: "Morocco", flagEmoji: "🇲🇦", set: 2 },
      { name: "Belgium", flagEmoji: "🇧🇪", set: 2 },
      { name: "Germany", flagEmoji: "🇩🇪", set: 2 },
      { name: "Croatia", flagEmoji: "🇭🇷", set: 2 },
      { name: "Colombia", flagEmoji: "🇨🇴", set: 2 },
    ],
  },
  {
    set: 3,
    label: "Set 3",
    teams: [
      { name: "Senegal", flagEmoji: "🇸🇳", set: 3 },
      { name: "Mexico", flagEmoji: "🇲🇽", set: 3 },
      { name: "United States", flagEmoji: "🇺🇸", set: 3 },
      { name: "Uruguay", flagEmoji: "🇺🇾", set: 3 },
      { name: "Japan", flagEmoji: "🇯🇵", set: 3 },
      { name: "Switzerland", flagEmoji: "🇨🇭", set: 3 },
    ],
  },
  {
    set: 4,
    label: "Set 4",
    teams: [
      { name: "Iran", flagEmoji: "🇮🇷", set: 4 },
      { name: "Türkiye", flagEmoji: "🇹🇷", set: 4 },
      { name: "Ecuador", flagEmoji: "🇪🇨", set: 4 },
      { name: "Austria", flagEmoji: "🇦🇹", set: 4 },
      { name: "South Korea", flagEmoji: "🇰🇷", set: 4 },
      { name: "Australia", flagEmoji: "🇦🇺", set: 4 },
    ],
  },
  {
    set: 5,
    label: "Set 5",
    teams: [
      { name: "Algeria", flagEmoji: "🇩🇿", set: 5 },
      { name: "Egypt", flagEmoji: "🇪🇬", set: 5 },
      { name: "Canada", flagEmoji: "🇨🇦", set: 5 },
      { name: "Norway", flagEmoji: "🇳🇴", set: 5 },
      { name: "Panama", flagEmoji: "🇵🇦", set: 5 },
      { name: "Ivory Coast", flagEmoji: "🇨🇮", set: 5 },
    ],
  },
  {
    set: 6,
    label: "Set 6",
    teams: [
      { name: "Sweden", flagEmoji: "🇸🇪", set: 6 },
      { name: "Paraguay", flagEmoji: "🇵🇾", set: 6 },
      { name: "Czechia", flagEmoji: "🇨🇿", set: 6 },
      { name: "Scotland", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", set: 6 },
      { name: "Tunisia", flagEmoji: "🇹🇳", set: 6 },
      { name: "Congo DR", flagEmoji: "🇨🇩", set: 6 },
    ],
  },
  {
    set: 7,
    label: "Set 7",
    teams: [
      { name: "Uzbekistan", flagEmoji: "🇺🇿", set: 7 },
      { name: "Qatar", flagEmoji: "🇶🇦", set: 7 },
      { name: "Iraq", flagEmoji: "🇮🇶", set: 7 },
      { name: "South Africa", flagEmoji: "🇿🇦", set: 7 },
      { name: "Saudi Arabia", flagEmoji: "🇸🇦", set: 7 },
      { name: "Jordan", flagEmoji: "🇯🇴", set: 7 },
    ],
  },
  {
    set: 8,
    label: "Set 8",
    teams: [
      { name: "Bosnia and Herzegovina", flagEmoji: "🇧🇦", set: 8 },
      { name: "Cape Verde", flagEmoji: "🇨🇻", set: 8 },
      { name: "Ghana", flagEmoji: "🇬🇭", set: 8 },
      { name: "Curaçao", flagEmoji: "🇨🇼", set: 8 },
      { name: "Haiti", flagEmoji: "🇭🇹", set: 8 },
      { name: "New Zealand", flagEmoji: "🇳🇿", set: 8 },
    ],
  },
];

export const ALL_TEAMS: TeamDef[] = SETS.flatMap((s) => s.teams);
