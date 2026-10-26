// Balises de structure (champ Lyrics) : sections Suno standard, nourries par les réglages
import type { Lexicon, Settings } from './types';

export function buildStructure(s: Settings, lex: Lexicon): string {
  const arc = lex.arcs.find((a) => a.id === s.arc);
  if (!arc) return '[Instrumental]';
  const inst = s.instruments.map((id) => lex.instruments.find((i) => i.id === id)).filter((x): x is NonNullable<typeof x> => !!x);
  const byRole = (...roles: string[]) => inst.find((i) => roles.includes(i.role));
  const sig = lex.signatures.find((x) => x.id === s.signature)?.short ?? 'motif';
  const drums = lex.drums.find((d) => d.id === s.drums)?.short ?? 'drums';
  const v: Record<string, string> = {
    lead: byRole('lead')?.short ?? sig,
    low: byRole('low')?.short ?? 'bass',
    texture: byRole('texture', 'support')?.short ?? 'atmosphere',
    sig,
    drums,
  };
  const soloInst = inst.find((i) => i.solo && i.role === 'lead') ?? inst.find((i) => i.solo);
  const lines = arc.tags
    .map((line) => (line === '{solo}' ? (soloInst ? `[${soloInst.solo}]` : '') : line.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? k)))
    .filter(Boolean)
    // sans batterie : pas de mention de batterie pleine
    .map((line) => (s.drums === 'none' ? line.replace(/, full drums|full drums/g, 'full weight') : line));
  return ['[Instrumental]', ...lines].join('\n');
}
