// Trois angles : accessible à signature / hybride / hors zone
import type { AngleId, Lexicon, Settings, Territory } from './types';
import { pick, type Rng } from './seed';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function deriveAngle(angle: AngleId, base: Settings, t: Territory, lex: Lexicon, rng: Rng): Settings {
  const s: Settings = { ...base, moods: [...base.moods], instruments: [...base.instruments], sliders: { ...base.sliders } };
  if (angle === 'access') return s;

  if (angle === 'hybrid') {
    // Greffe proche, différente de celle de l'angle accessible
    const ids = t.grafts.map((g) => g.id);
    const near = ids.filter((g) => g !== base.graft);
    s.graft = pick(near.length ? near : ids, rng);
    s.sliders.tension = clamp(s.sliders.tension + 10);
    return s;
  }

  // Hors zone : greffe lointaine, autre arc, intensités poussées
  const farIds = t.far.map((g) => g.id);
  const far = farIds.filter((g) => g !== base.graft);
  s.graft = pick(far.length ? far : farIds, rng);
  const otherArcs = lex.arcs.map((a) => a.id).filter((id) => id !== base.arc);
  s.arc = pick(otherArcs, rng);
  const otherSigs = lex.signatures.map((x) => x.id).filter((id) => id !== base.signature);
  if (rng() < 0.5) s.signature = pick(otherSigs, rng);
  s.sliders.tension = clamp(s.sliders.tension + 15);
  s.sliders.hypnosis = clamp(s.sliders.hypnosis + 15);
  s.sliders.grain = clamp(s.sliders.grain + 10);
  return s;
}
