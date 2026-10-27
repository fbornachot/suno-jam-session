// Trois angles : accessible à signature / hybride / hors zone
import type { AngleId, Lexicon, Settings, Territory } from './types';
import { pick, type Rng } from './seed';
import { incompatible, compatibleSignature } from './compatibility';

export const DISCOVERIES = ['rythme', 'harmonie lumineuse', 'geste acoustique', 'espace dépouillé'] as const;

export function deriveAngle(angle: AngleId, base: Settings, t: Territory, lex: Lexicon, rng: Rng, axis = 0): Settings {
  const s: Settings = { ...base, moods: [...base.moods], instruments: [...base.instruments], sliders: { ...base.sliders } };
  if (angle === 'access') return s;

  if (angle === 'hybrid') {
    // Greffe proche, différente de celle de l'angle accessible
    const ids = t.grafts.filter(g => !incompatible(typeof g.phrase === 'string' ? g.phrase : g.phrase.join(' '), s, false)).map((g) => g.id);
    const near = ids.filter((g) => g !== base.graft);
    s.graft = ids.length ? pick(near.length ? near : ids, rng) : null;
    return s;
  }

  // Four independent editorial directions, reproducible from the seed.
  // None forces an increase in darkness, distortion or intensity.
  const acoustic = [...t.grafts, ...t.far].filter(g => /piano|guitar|strings|brass|trumpet|horn|flute|sitar|harpsichord|vibraphone|quartet|saxophone/i.test(JSON.stringify(g.phrase)) && !/overdriven|fuzz|synth|electric|tracker/i.test(JSON.stringify(g.phrase)));
  const candidates = axis === 2 && acoustic.length ? acoustic : t.far;
  const farIds = candidates.filter(g => !incompatible(typeof g.phrase === 'string' ? g.phrase : g.phrase.join(' '), s, false)).map((g) => g.id);
  const far = farIds.filter((g) => g !== base.graft);
  s.graft = farIds.length ? pick(far.length ? far : farIds, rng) : null;
  if (axis === 0) {
    if (s.drums !== 'none') s.sliders.placement = s.sliders.placement > 40 ? 25 : 80;
    s.sliders.hypnosis = s.sliders.hypnosis > 60 ? 35 : 85;
  } else if (axis === 1) {
    s.sliders.tension = 20;
    s.moods = ['euphoric', 'consoling'];
  } else if (axis === 2) {
    s.sliders.saturation = 15;
    s.sliders.roots = 0;
    const otherSigs = lex.signatures.map(x => x.id).filter(id => id !== base.signature && compatibleSignature(id, s));
    if (otherSigs.length) s.signature = pick(otherSigs, rng);
  } else {
    s.sliders.space = 15;
    s.sliders.grain = 20;
    s.arc = base.arc === 'hypnosis' ? 'long_form' : 'hypnosis';
  }
  return s;
}
