import { describe, expect, it } from 'vitest';
import { territories, lexicon } from '../src/engine/data';
import { compile, compileAll, resolve } from '../src/engine';
import { PERCUSSION } from '../src/engine/compatibility';

describe('choix explicites et sorties cohérentes', () => {
  for (const t of territories) it(`${t.id} : sans batterie sur tous les presets et angles`, () => {
    for (const p of [null, ...t.presets.map(p => p.id)]) for (let seed = 1; seed <= 12; seed++) {
      const s = { ...resolve(t, p), drums: 'none', signature: 'drum_pattern' };
      s.instruments = [...s.instruments.slice(0, 3), 'percussion'];
      for (const o of compileAll(s, t, lexicon, seed)) {
        const positive = o.prompt.replace(/no drums or unpitched percussion/ig, '');
        expect(positive, `${p}/${seed}/${o.angle}: ${o.prompt}`).not.toMatch(PERCUSSION);
        expect(o.structure).not.toMatch(PERCUSSION);
        expect(o.settings.instruments).not.toContain('percussion');
        expect(o.settings.signature).not.toBe('drum_pattern');
        expect(o.exclude.split(', ')[0]).toBe('drums');
        expect(o.prompt.length).toBeLessThanOrEqual(990);
      }
      expect(s.instruments).toContain('percussion'); // compilation never mutates the controls
    }
  });

  it('retirer les guitares ne laisse ni détail ni solo de guitare caché', () => {
    for (const t of territories) for (const p of t.presets) {
      const s = { ...resolve(t, p.id), instruments: ['piano_felt'], graft: null, signature: 'riff' };
      const o = compile(s, t, lexicon, 1);
      expect(o.prompt + o.structure + o.styleTags).not.toMatch(/\b(guitars?|bassline|organ)\b|snare.*no percussion/i);
      expect(o.structure).not.toContain('Bass Solo');
      expect(o.blocks.find(b => b.key === 'detail')?.status).toBe('incompatible');
    }
  });

  it('aucun instrument ne crée pas une basse de secours dans Lyrics', () => {
    for (const t of territories) {
      const o = compile({ ...resolve(t), instruments: [], graft: null, arc: 'central_break' }, t, lexicon, 1);
      expect(o.structure).not.toMatch(/bass|guitar|piano|solo/i);
    }
  });

  it('Trap cinématique ne devient pas boom-bap par hasard', () => {
    const t = territories.find(t => t.id === 'rap_beat')!;
    for (let seed = 1; seed <= 25; seed++) for (const o of compileAll(resolve(t, 'cinematic_trap'), t, lexicon, seed)) {
      expect(o.prompt + o.styleTags).not.toMatch(/boom[- ]bap/i);
      expect(o.prompt).toMatch(/^Cinematic trap/);
    }
  });
});

describe('aperçu du résultat réellement copié', () => {
  it('les blocs conservés reconstituent exactement le prompt, compléments compris', () => {
    for (const t of territories) for (let seed = 1; seed <= 10; seed++) for (const o of compileAll(resolve(t), t, lexicon, seed)) {
      expect(o.blocks.filter(b => b.status === 'kept').map(b => b.text).join(' ')).toBe(o.prompt);
      for (const b of o.blocks.filter(b => b.status === 'dropped' || b.status === 'incompatible')) expect(o.prompt).not.toContain(b.text);
    }
  });
  it('un détail incompatible et un arc reporté dans Lyrics sont distincts', () => {
    const t = territories[0];
    const outputs = Array.from({ length: 30 }, (_, i) => compile({ ...resolve(t, t.presets[0].id), drums: 'none' }, t, lexicon, i));
    expect(outputs.every(o => o.blocks.some(b => b.key === 'detail' && b.status === 'incompatible'))).toBe(true);
    const full = territories.flatMap(t => t.presets.flatMap(p => compileAll(resolve(t, p.id), t, lexicon, 1)));
    expect(full.some(o => o.blocks.some(b => b.key === 'arc' && b.status === 'structure'))).toBe(true);
  });
});

describe('découvertes contrastées', () => {
  it('quatre directions reproductibles sans augmentation systématique des intensités', () => {
    for (const t of territories) {
      const s = resolve(t);
      const outs = [0, 1, 2, 3].map(seed => compile(s, t, lexicon, seed, 'risk'));
      expect(new Set(outs.map(o => o.discovery)).size).toBe(4);
      expect(outs[1].settings.sliders.tension).toBe(20);
      expect(outs[1].settings.moods).toEqual(['euphoric', 'consoling']);
      expect(outs[2].settings.sliders.saturation).toBe(15);
      expect(outs[3].settings.sliders.space).toBe(15);
      for (const o of outs) {
        expect(o.settings.bpm).toBe(s.bpm);
        expect(o.settings.key).toBe(s.key);
        expect(o.settings.drums).toBe(s.drums);
        expect(o.settings.instruments).toEqual(s.instruments);
      }
      expect(outs[0]).toEqual(compile(s, t, lexicon, 0, 'risk'));
    }
  });
  it('six greffes relationnelles sur trois territoires, avec deux niveaux écrits', () => {
    const selected = territories.filter(t => [...t.grafts, ...t.far].some(g => g.interaction));
    expect(selected).toHaveLength(3);
    const grafts = selected.flatMap(t => [...t.grafts, ...t.far].filter(g => g.interaction));
    expect(grafts).toHaveLength(6);
    for (const t of selected) for (const g of [...t.grafts, ...t.far].filter(g => g.interaction)) {
      const o = compile({ ...resolve(t), graft: g.id }, t, lexicon, 1);
      const block = o.blocks.find(b => b.key === 'graft')!;
      expect(block.text.toLowerCase()).toContain(g.interaction!.subtle.toLowerCase());
      expect(g.interaction!.structural).not.toBe(g.interaction!.subtle);
      expect(o.changes.some(c => c.includes(g.label))).toBe(true);
    }
  });
});
