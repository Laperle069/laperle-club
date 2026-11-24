import type { MeDto, TeamMemberDto } from "@lume/api/types";
import { api, ApiRequestError } from "@/lib/api";
import { changeTeamRole, removeTeamMember } from "@/app/auth-actions";
import { TeamForm } from "@/app/forms";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

const ROLES = [
  ["owner", "Inhaber"],
  ["manager", "Leitung"],
  ["reception", "Empfang"],
  ["staff", "Mitarbeiter"],
] as const;

export default async function Team({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  let me: MeDto;
  let team: TeamMemberDto[];
  try {
    [me, team] = await Promise.all([api<MeDto>("/auth/me"), api<TeamMemberDto[]>("/team")]);
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  const canManage = me.role === "owner";
  return (
    <>
      <h1>Team und Zugänge</h1>
      <p className="muted">Wer sich im Backoffice anmelden darf und was diese Person sehen und tun kann.</p>
      <Notice fehler={get("fehler")} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Zuletzt angemeldet</th>
            {canManage ? <th /> : null}
          </tr>
        </thead>
        <tbody>
          {team.map((m) => (
            <tr key={m.userId}>
              <td>
                {m.name} {m.userId === me.user.id ? <span className="muted small">(du)</span> : null}
              </td>
              <td>{m.email}</td>
              <td>
                {canManage ? (
                  <form action={changeTeamRole} className="row">
                    <input type="hidden" name="userId" value={m.userId} />
                    <select name="role" defaultValue={m.role} aria-label={`Rolle von ${m.name}`}>
                      {ROLES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button className="ghost small">Ändern</button>
                  </form>
                ) : (
                  ROLES.find(([v]) => v === m.role)?.[1]
                )}
              </td>
              <td>{m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) : "noch nie"}</td>
              {canManage ? (
                <td>
                  {m.userId !== me.user.id ? (
                    <form action={removeTeamMember}>
                      <input type="hidden" name="userId" value={m.userId} />
                      <button className="ghost small danger">Zugang entziehen</button>
                    </form>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {canManage ? <TeamForm /> : null}
    </>
  );
}
