import { prisma } from "@/lib/db";
import { SETS } from "@/lib/groups";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    where: { set: { gt: 0 } },
    orderBy: [{ score: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Team Scores</h1>

      {SETS.map((s) => {
        const setTeams = teams.filter((t) => t.set === s.set);
        return (
          <Card key={s.set}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {setTeams.map((team) => (
                  <div key={team.id} className="flex items-center gap-3 py-1">
                    <span className="text-xl">{team.flagEmoji}</span>
                    <span className="flex-1 text-sm">{team.name}</span>
                    <Badge variant="outline" className="font-mono text-green-700 border-green-300">
                      {team.score.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
