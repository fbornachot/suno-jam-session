import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from 'vitest';
import { territories, lexicon } from '../src/engine/data';
import { compile, resolve, ANGLES } from '../src/engine';

// Audit descriptif reproductible : les résultats ne constituent pas un test audio.
test('mesurer le comportement du moteur sans modifier les sorties', () => {
  const report = {
    protocol: '12 territoires × (4 presets + base) × 25 seeds × 3 angles',
    total: 0, minLength: Infinity, maxLength: 0,
    outputsWithFillers: 0, fillerCharacters: 0,
    removed: {} as Record<string, number>,
    available: {} as Record<string, number>,
    firstLexiconEraDiffers: 0, eraPresent: 0,
    voiceRoomRemoved: 0, voiceRoomCases: 0,
    examples: {} as Record<string, unknown>,
  };
  for (const t of territories) for (const p of [null, ...t.presets.map(p => p.id)]) {
    for (let seed = 1; seed <= 25; seed++) for (const angle of ANGLES) {
      const base = resolve(t, p);
      const output = compile(base, t, lexicon, seed, angle);
      const s = output.settings;
      const all = output.blocks.filter(b => b.status !== 'incompatible' && !b.key.startsWith('filler'));
      const kept = output.blocks.filter(b => b.status === 'kept');
      const text = kept.map(b => b.text).join(' ');
      expect(text).toBe(output.prompt);
      report.total++;
      report.minLength = Math.min(report.minLength, text.length);
      report.maxLength = Math.max(report.maxLength, text.length);
      const fillers = kept.filter(s => s.key.startsWith('filler'));
      if (fillers.length) report.outputsWithFillers++;
      report.fillerCharacters += fillers.reduce((sum, s) => sum + s.text.length, 0);
      for (const slot of all) {
        report.available[slot.key] = (report.available[slot.key] ?? 0) + 1;
        if (!kept.some(s => s.key === slot.key)) {
          report.removed[slot.key] = (report.removed[slot.key] ?? 0) + 1;
          if (!report.examples[slot.key + 'Removed']) report.examples[slot.key + 'Removed'] = { territory: t.id, preset: p, seed, angle, text: slot.text };
        }
      }
      const era = kept.find(s => s.key === 'era');
      if (era) {
        report.eraPresent++;
        const phrases = lexicon.eras.find(e => e.id === s.era)!.phrase;
        const first = Array.isArray(phrases) ? phrases[0] : phrases;
        if (era.text.toLowerCase() !== (first.replace(/[.\s]+$/, '') + '.').toLowerCase()) report.firstLexiconEraDiffers++;
      }
      const vocal = compile({ ...base, voiceRoom: true }, t, lexicon, seed, angle);
      report.voiceRoomCases++;
      if (!vocal.prompt.includes(lexicon.rules.voiceRoom)) report.voiceRoomRemoved++;
    }
  }
  const rap = territories.find(t => t.id === 'rap_beat')!;
  report.examples.noDrums = compile({ ...resolve(rap, 'dusty_bap'), drums: 'none' }, rap, lexicon, 1);
  report.examples.trap = compile(resolve(rap, 'cinematic_trap'), rap, lexicon, 1);
  const t = territories[0];
  report.examples.noInstruments = compile({ ...resolve(t), instruments: [], arc: 'central_break' }, t, lexicon, 1);
  expect(report.total).toBe(4500);
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/audit-results-current.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, examples: Object.keys(report.examples) }, null, 2));
});
