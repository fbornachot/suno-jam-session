// Résolution de l'état : défauts du territoire ← preset ← choix utilisateur
import type { Settings, Territory } from './types';

export function resolve(t: Territory, presetId: string | null = null): Settings {
  const d = t.defaults;
  const base: Settings = {
    territory: t.id,
    preset: null,
    era: d.era,
    drums: d.drums,
    arc: d.arc,
    signature: d.signature,
    moods: [...d.moods],
    bpm: d.bpm,
    key: d.key,
    sliders: { ...d.sliders },
    instruments: [...d.instruments],
    graft: null,
    voiceRoom: false,
  };
  const p = presetId ? t.presets.find((x) => x.id === presetId) : undefined;
  if (!p) return base;
  const { sliders, ...rest } = p.set;
  return {
    ...base,
    ...rest,
    preset: p.id,
    moods: rest.moods ? [...rest.moods] : base.moods,
    instruments: rest.instruments ? [...rest.instruments] : base.instruments,
    sliders: { ...base.sliders, ...(sliders ?? {}) },
  };
}
