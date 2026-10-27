// Assemblage du prompt par slots ordonnés + priorité de suppression
import type { AngleId, CompiledBlock, Lexicon, Settings, Territory } from './types';
import { bucket } from './buckets';
import { phrase, pick, type Rng } from './seed';
import { incompatible, PERCUSSION } from './compatibility';
import { resolve } from './resolve';

export interface Slot {
  key: string;
  order: number;     // position dans le prompt
  priority: number;  // plus bas = supprimé en premier si trop long
  core: boolean;     // jamais supprimé
  text: string;
}

const sentence = (s: string) => {
  const t = s.trim().replace(/[.\s]+$/, '');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) + '.' : '';
};

const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function buildSlots(s: Settings, t: Territory, lex: Lexicon, rng: Rng, rejected: CompiledBlock[] = [], angle: AngleId = 'access'): Slot[] {
  const find = <T extends { id: string }>(list: T[], id: string | null) => list.find((x) => x.id === id);
  const slots: Slot[] = [];
  const add = (key: string, order: number, priority: number, core: boolean, text: string) => {
    const reason = key === 'drums' || key === 'instruments' ? null : incompatible(text, s, key !== 'graft');
    if (reason) { rejected.push({ key, label: key, text: sentence(text), status: 'incompatible', reason }); return; }
    const txt = sentence(text);
    if (txt) slots.push({ key, order, priority, core, text: txt });
  };

  const preset = t.presets.find((p) => p.id === s.preset);
  const sl = lex.sliders;

  const neutral: Record<string, string> = { trip_hop: 'trip-hop', indie_tense: 'indie rock', rock_drama: 'theatrical art rock', funk_rock: 'funk rock', psych_longform: 'psychedelic rock', dark_electro: 'cinematic electronica', fragile_pop: 'intimate pop', neoclassical: 'modern chamber music', offbeat_pop: 'alternative pop', soul_groove: 'soul', rap_beat: 'hip-hop production', glam_rock: 'glam rock' };
  const identity = preset?.id === 'cinematic_trap' ? 'cinematic trap' : preset?.id === 'rock_opera' ? 'theatrical glam art rock' : preset?.id === 'glam_psych' ? 'psychedelic glam rock' : preset?.id === 'neon_glam' ? 'motorik glam rock' : null;
  const core = identity ?? (angle === 'risk' ? neutral[t.id] : pick(t.core.filter(x => !incompatible(x, s)), rng));
  add('core', 10, 100, true, core || neutral[t.id] || 'expressive music');
  if (preset) {
    const initial = resolve(t, preset.id);
    // Preset prose can contain rhythm, timbre and form assumptions. Do not retain
    // it blindly once those assumptions have been overridden.
    const changed = (['drums', 'arc', 'signature', 'era'] as const).some(k => s[k] !== initial[k])
      || JSON.stringify(s.instruments) !== JSON.stringify(initial.instruments)
      || JSON.stringify(s.moods) !== JSON.stringify(initial.moods)
      || Object.keys(s.sliders).some(k => s.sliders[k as keyof typeof s.sliders] !== initial.sliders[k as keyof typeof s.sliders]);
    const text = pick(preset.detail, rng);
    if (changed) rejected.push({ key: 'detail', label: 'Détail du preset', text: sentence(text), status: 'incompatible', reason: 'Détail lié aux réglages initiaux du preset ; vos choix et les variations de cet angle sont prioritaires.' });
    else add('detail', 15, 95, false, text);
  }

  const era = find(lex.eras, s.era);
  if (era) {
    const variants = (Array.isArray(era.phrase) ? era.phrase : [era.phrase]).filter(x => !PERCUSSION.test(x) && !incompatible(x, s));
    if (variants.length) add('era', 20, 60, false, pick(variants, rng));
    else rejected.push({ key: 'era', label: 'Époque', text: phrase(era.phrase, rng), status: 'incompatible', reason: 'Cette description impose une instrumentation ou une batterie différente.' });
  }

  const drums = find(lex.drums, s.drums);
  if (drums) {
    const place = s.drums === 'none' ? '' : `, ${bucket(sl.placement, s.sliders.placement)}`;
    add('drums', 30, 90, true, phrase(drums.phrase, rng) + place);
  }

  const sig = find(lex.signatures, s.signature);
  if (sig) add('signature', 40, 88, false, phrase(sig.phrase, rng));

  const roleOrder = { lead: 0, low: 1, support: 2, texture: 3 } as const;
  const inst = s.instruments
    .map((id) => find(lex.instruments, id))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => roleOrder[a.role] - roleOrder[b.role])
    .map((i) => phrase(i.phrase, rng));
  if (inst.length) add('instruments', 50, 92, true, `featuring ${listJoin(inst)}`);

  const graft = find([...t.grafts, ...t.far], s.graft);
  if (graft) {
    const interaction = graft.interaction;
    const missing = interaction?.requires?.filter(prefix => !s.instruments.some(id => id.startsWith(prefix)));
    const text = interaction ? (angle === 'risk' ? interaction.structural : interaction.subtle) : phrase(graft.phrase, rng);
    if (missing?.length) rejected.push({ key: 'graft', label: 'Greffe', text, status: 'incompatible', reason: 'Cette interaction exige un instrument d’accompagnement non sélectionné.' });
    else add('graft', 55, 85, false, `plus ${text}`);
  }

  for (const [i, key] of (['grain', 'saturation', 'roots', 'tension', 'hypnosis'] as const).entries()) {
    add(key, 60 + i * 0.5, i < 3 ? 78 : 75, false, bucket(sl[key], s.sliders[key]));
  }

  const space = bucket(sl.space, s.sliders.space);
  if (space) add('space', 64, 65, false, space);

  const arc = find(lex.arcs, s.arc);
  if (arc) add('arc', 80, 40, false, phrase(arc.phrase, rng));

  const moods = s.moods.slice(0, 2).map((id) => find(lex.moods, id)).filter(Boolean).map((m) => phrase(m!.phrase, rng));
  if (moods.length) add('moods', 85, 80, false, `mood: ${listJoin(moods)}`);

  const tempo = `around ${s.bpm} BPM${s.key && s.key !== 'any' ? `, in ${s.key}` : ''}`;
  add('tempo', 88, 94, true, tempo);

  if (s.voiceRoom) add('voiceRoom', 90, 84, false, lex.rules.voiceRoom);

  add('closer', 95, 30, false, s.drums === 'none' ? lex.rules.closerNoDrums : pick(lex.rules.closer, rng));
  return slots;
}

export function render(slots: Slot[]): string {
  return [...slots].sort((a, b) => a.order - b.order).map((x) => x.text).join(' ');
}
