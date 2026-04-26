// WC 2026 group assignments — team names must match exactly what is stored in the DB
export interface WcGroup {
  letter: string;
  teams: string[];
}

export const WC_GROUPS: WcGroup[] = [
  { letter: "A", teams: ["Mexico", "South Africa", "South Korea", "Czechia"] },
  { letter: "B", teams: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"] },
  { letter: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  { letter: "D", teams: ["United States", "Paraguay", "Australia", "Türkiye"] },
  { letter: "E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  { letter: "F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  { letter: "G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
  { letter: "H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
  { letter: "I", teams: ["France", "Senegal", "Norway", "Iraq"] },
  { letter: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  { letter: "K", teams: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"] },
  { letter: "L", teams: ["England", "Croatia", "Ghana", "Panama"] },
];
