// Contrôle qualité : anti-attracteurs, noms d'artistes, longueur
import type { LintIssue, Rules, Settings } from './types';
import { MAX_LEN, MIN_LEN } from './fit';

export function lint(prompt: string, s: Settings, rules: Rules): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const r of rules.banned) {
    const m = prompt.match(new RegExp(r.pattern, 'i'));
    if (m) issues.push({ level: 'error', message: `« ${m[0]} » — ${r.reason}` });
  }
  for (const name of rules.artistGuard) {
    if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(prompt)) {
      issues.push({ level: 'error', message: `Nom d'artiste « ${name} » : Suno le rejettera` });
    }
  }
  const len = prompt.length;
  if (len > MAX_LEN) issues.push({ level: 'error', message: `${len} car. : au-dessus de ${MAX_LEN}` });
  if (len < MIN_LEN) issues.push({ level: 'warn', message: `${len} car. : sous la cible de ${MIN_LEN}` });
  if (s.moods.length > 2) issues.push({ level: 'warn', message: 'Plus de 2 moods : seuls les 2 premiers sont utilisés' });
  if (s.instruments.length > 4) issues.push({ level: 'warn', message: 'Plus de 4 instruments : risque de mix surchargé' });
  if (s.instruments.length === 0) issues.push({ level: 'warn', message: 'Aucun instrument : Suno choisira seul' });
  return issues;
}
