import { describe, it, expect } from 'vitest';
import { territories, lexicon } from '../src/engine/data';
import { resolve, compile, compileAll, MIN_LEN, MAX_LEN, ANGLES } from '../src/engine';

const ids = (l: { id: string }[]) => new Set(l.map((x) => x.id));
const L = {
  eras: ids(lexicon.eras), drums: ids(lexicon.drums), arcs: ids(lexicon.arcs), sig: ids(lexicon.signatures),
  moods: ids(lexicon.moods), inst: ids(lexicon.instruments),
};

describe('intégrité de la palette', () => {
  it('12 territoires, 4 presets chacun dont 1 création', () => {
    expect(territories).toHaveLength(12);
    territories.forEach((t) => { expect(t.presets).toHaveLength(4); expect(t.presets.filter((p) => p.ref === 'Création')).toHaveLength(1); });
  });
  for (const t of territories) {
    it(`${t.id} : toutes les références existent`, () => {
      [t.defaults, ...t.presets.map((p) => resolve(t, p.id))].forEach((s: any) => {
        expect(L.eras.has(s.era), s.era).toBe(true);
        expect(L.drums.has(s.drums), s.drums).toBe(true);
        expect(L.arcs.has(s.arc), s.arc).toBe(true);
        expect(L.sig.has(s.signature), s.signature).toBe(true);
        s.moods.forEach((m: string) => expect(L.moods.has(m), m).toBe(true));
        s.instruments.forEach((i: string) => expect(L.inst.has(i), i).toBe(true));
        if (s.graft) expect([...t.grafts, ...t.far].some((g) => g.id === s.graft), s.graft).toBe(true);
      });
      expect(t.grafts.length).toBeGreaterThanOrEqual(4);
      expect(t.far.length).toBeGreaterThanOrEqual(3);
      expect(t.exclude.length).toBeLessThanOrEqual(3);
    });
  }
});

describe('sorties', () => {
  const cases = territories.flatMap((t) => [null, ...t.presets.map((p) => p.id)].map((p) => ({ t, p })));
  for (const { t, p } of cases) {
    it(`${t.id}/${p ?? 'défaut'} : longueur et lint sur 25 seeds × 3 angles`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        for (const o of compileAll(resolve(t, p), t, lexicon, seed)) {
          expect(o.prompt.length, `${o.angle} ${seed}: ${o.prompt}`).toBeGreaterThanOrEqual(MIN_LEN);
          expect(o.prompt.length).toBeLessThanOrEqual(MAX_LEN);
          expect(o.lint.filter((i) => i.level === 'error'), o.prompt).toEqual([]);
          expect(o.prompt).not.toMatch(/\.\./);
          expect(o.prompt).not.toMatch(/instrumental/i);
          expect(o.exclude.split(', ').length).toBeLessThanOrEqual(3);
          expect(o.structure.startsWith('[Instrumental]')).toBe(true);
          expect(o.structure).not.toMatch(/\{\w+\}/);
        }
      }
    });
  }
  it('déterministe pour un même seed', () => {
    const t = territories[0];
    expect(compile(resolve(t), t, lexicon, 42).prompt).toBe(compile(resolve(t), t, lexicon, 42).prompt);
  });
  it('les 3 angles diffèrent', () => {
    const t = territories[0];
    const out = compileAll(resolve(t), t, lexicon, 7).map((o) => o.prompt);
    expect(new Set(out).size).toBe(ANGLES.length);
  });
  it('voix optionnelle injectée', () => {
    const t = territories[6];
    const s = { ...resolve(t), voiceRoom: true };
    expect(compile(s, t, lexicon, 3).prompt).toContain('midrange space');
  });
});
