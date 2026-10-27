// Point d'entrée du moteur
import type { AngleId, CompiledBlock, Lexicon, Output, Settings, Territory } from './types';
import { buildSlots, render } from './assemble';
import { fit, MAX_LEN as MAX } from './fit';
import { lint } from './lint';
import { deriveAngle, DISCOVERIES } from './angles';
import { makeRng } from './seed';
import { buildStructure } from './structure';
import { incompatible, reconcile } from './compatibility';
import { phrase } from './seed';

export * from './types';
export { resolve } from './resolve';
export { MIN_LEN, MAX_LEN } from './fit';

export const ANGLES: AngleId[] = ['access', 'hybrid', 'risk'];

export function compile(s: Settings, t: Territory, lex: Lexicon, seed: number, angle: AngleId = 'access'): Output {
  const rng = makeRng(seed + ANGLES.indexOf(angle) * 7919);
  const axis = (seed >>> 0) % DISCOVERIES.length;
  const settings = deriveAngle(angle, s, t, lex, rng, axis);
  const changes = reconcile(settings, lex);
  const rejected: CompiledBlock[] = [];
  const fillers = [...t.extra, ...lex.rules.fillers].filter(text => !incompatible(text, settings));
  const all = buildSlots(settings, t, lex, rng, rejected, angle);
  const kept = fit(all, fillers, rng);
  const prompt = render(kept);
  const LABELS: Record<string, string> = { core: 'Identité', drums: 'Batterie / placement', instruments: 'Instruments', era: 'Époque', arc: 'Arc', space: 'Espace', grain: 'Grain', saturation: 'Saturation', roots: 'Racines hard-rock', tension: 'Tension', hypnosis: 'Hypnose', moods: 'Moods', graft: 'Greffe', signature: 'Signature', detail: 'Détail du preset', voiceRoom: 'Place pour la voix', tempo: 'Tempo / tonalité', closer: 'Conclusion' };
  const blocks: CompiledBlock[] = [...all.map(x => ({ key: x.key, label: LABELS[x.key] ?? x.key, text: x.text, status: kept.some(k => k.key === x.key) ? 'kept' as const : x.key === 'arc' ? 'structure' as const : 'dropped' as const })), ...rejected.map(x => ({ ...x, label: LABELS[x.key] ?? x.label })), ...kept.filter(x => x.key.startsWith('filler')).map(x => ({ key: x.key, label: 'Complément', text: x.text, status: 'kept' as const }))];
  // Render order is exposed too: joining kept blocks reproduces the copied Style.
  blocks.sort((a, b) => {
    const order = (key: string) => [...all, ...kept].find(x => x.key === key)?.order ?? 999;
    return order(a.key) - order(b.key);
  });
  const dropped = blocks.filter(x => x.status === 'dropped').map(x => x.label);
  const moodWords = settings.moods.slice(0, 2).map(id => lex.moods.find(m => m.id === id)).filter(x => !!x).map(m => phrase(m!.phrase, makeRng(seed)).split(',')[0]);
  const coreTag = kept.find(x => x.key === 'core')!.text.split(',')[0].replace(/\.$/, '');
  const graft = [...t.grafts, ...t.far].find(g => g.id === settings.graft);
  if (graft && blocks.some(b => b.key === 'graft' && b.status === 'kept')) changes.push(`Greffe ajoutée à la sélection : ${graft.label}${graft.interaction ? ' — ' + graft.interaction.role : ''}.`);
  const styleTags = [coreTag, ...(settings.drums === 'none' ? ['no drums or unpitched percussion'] : [lex.drums.find(d => d.id === settings.drums)?.short]), ...settings.instruments.map(id => lex.instruments.find(i => i.id === id)?.short), ...(graft && blocks.some(b => b.key === 'graft' && b.status === 'kept') ? [graft.short ?? 'cross-style interplay'] : []), `${settings.bpm} bpm`, ...(settings.key && settings.key !== 'any' ? [settings.key] : []), ...moodWords].filter(Boolean).join(', ');

  const structure = buildStructure(settings, lex);
  // 3 exclusions max : dérives de style voisines ; sans batterie, on exclut la batterie en premier
  const exclude = [...(settings.drums === 'none' ? ['drums'] : []), ...t.exclude].slice(0, 3).join(', ');

  return { angle, settings, blocks, changes, discovery: angle === 'risk' ? DISCOVERIES[axis] : null, prompt, styleTags, structure, exclude, lint: [...lint(prompt, settings, lex.rules), ...changes.filter(c => !c.startsWith('Greffe ajoutée')).map(message => ({ level: 'warn' as const, message })), ...dropped.map((d) => ({ level: 'warn' as const, message: `Retiré pour tenir en ${MAX} car. : ${d}` }))] };
}

export function compileAll(s: Settings, t: Territory, lex: Lexicon, seed: number): Output[] {
  return ANGLES.map((a) => compile(s, t, lex, seed, a));
}

export type { Lexicon, Territory, Settings };
