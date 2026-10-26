// Assemblage du prompt par slots ordonnés + priorité de suppression
import type { Lexicon, Settings, Territory } from './types';
import { bucket } from './buckets';
import { phrase, pick, type Rng } from './seed';

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

export function buildSlots(s: Settings, t: Territory, lex: Lexicon, rng: Rng): Slot[] {
  const find = <T extends { id: string }>(list: T[], id: string | null) => list.find((x) => x.id === id);
  const slots: Slot[] = [];
  const add = (key: string, order: number, priority: number, core: boolean, text: string) => {
    const txt = sentence(text);
    if (txt) slots.push({ key, order, priority, core, text: txt });
  };

  const preset = t.presets.find((p) => p.id === s.preset);
  const sl = lex.sliders;

  add('core', 10, 100, true, pick(t.core, rng));
  if (preset) add('detail', 15, 95, false, pick(preset.detail, rng));

  const era = find(lex.eras, s.era);
  if (era) add('era', 20, 60, false, phrase(era.phrase, rng));

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
  if (graft) add('graft', 55, 85, false, `plus ${phrase(graft.phrase, rng)}`);

  const tex = [bucket(sl.grain, s.sliders.grain), bucket(sl.saturation, s.sliders.saturation), bucket(sl.roots, s.sliders.roots)].filter(Boolean);
  if (tex.length) add('texture', 60, 78, false, tex.join(', '));

  const harm = [bucket(sl.tension, s.sliders.tension), bucket(sl.hypnosis, s.sliders.hypnosis)].filter(Boolean);
  if (harm.length) add('harmony', 62, 75, false, harm.join(', '));

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
