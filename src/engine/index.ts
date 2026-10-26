// Point d'entrée du moteur
import type { AngleId, Lexicon, Output, Settings, Territory } from './types';
import { buildSlots, render } from './assemble';
import { fit, MAX_LEN as MAX } from './fit';
import { lint } from './lint';
import { deriveAngle } from './angles';
import { makeRng } from './seed';
import { buildStructure } from './structure';

export * from './types';
export { resolve } from './resolve';
export { MIN_LEN, MAX_LEN } from './fit';

export const ANGLES: AngleId[] = ['access', 'hybrid', 'risk'];

export function compile(s: Settings, t: Territory, lex: Lexicon, seed: number, angle: AngleId = 'access'): Output {
  const rng = makeRng(seed + ANGLES.indexOf(angle) * 7919);
  const settings = deriveAngle(angle, s, t, lex, rng);
  const fillers = [...t.extra, ...lex.rules.fillers];
  const all = buildSlots(settings, t, lex, rng);
  const kept = fit(all, fillers, rng);
  const prompt = render(kept);
  const LABELS: Record<string, string> = { era: 'Époque', arc: 'Arc (porté par les balises de structure)', space: 'Espace', harmony: 'Tension / hypnose', texture: 'Grain / saturation / racines', moods: 'Moods', graft: 'Greffe', signature: 'Signature', detail: 'Détail du preset', voiceRoom: 'Place pour la voix' };
  const dropped = all.filter((x) => x.key !== 'closer' && x.key !== 'arc' && !kept.some((k) => k.key === x.key)).map((x) => LABELS[x.key] ?? x.key);

  const moodWords = settings.moods.slice(0, 2).map((id) => lex.moods.find((m) => m.id === id)?.phrase as string).filter(Boolean).map((m) => m.split(',')[0]);
  const styleTags = [...t.tags, `${settings.bpm} bpm`, ...(settings.key && settings.key !== 'any' ? [settings.key] : []), ...moodWords].join(', ');

  const structure = buildStructure(settings, lex);
  // 3 exclusions max : dérives de style voisines ; sans batterie, on exclut la batterie en premier
  const exclude = [...(settings.drums === 'none' ? ['drums'] : []), ...t.exclude].slice(0, 3).join(', ');

  return { angle, settings, prompt, styleTags, structure, exclude, lint: [...lint(prompt, settings, lex.rules), ...dropped.map((d) => ({ level: 'warn' as const, message: `Retiré pour tenir en ${MAX} car. : ${d}` }))] };
}

export function compileAll(s: Settings, t: Territory, lex: Lexicon, seed: number): Output[] {
  return ANGLES.map((a) => compile(s, t, lex, seed, a));
}

export type { Lexicon, Territory, Settings };
