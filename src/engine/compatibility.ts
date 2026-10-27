import type { Lexicon, Settings } from './types';

// Vocabulary dependencies for this editorial catalogue. A rejected phrase is
// omitted as a whole (never surgically rewritten into a different intention).
// Pitched percussion remains available; "none" forbids kits and unpitched percussion.
export const PERCUSSION = /\b(drums?|drummer|drumming|kit|snare|kick|hi[- ]?hats?|hats|cymbals?|toms?|floor[- ]toms?|percussion|congas?|timbales?|shakers?|handclaps?|claps?|stomps?|backbeat|breakbeat|breaks|boom[- ]bap|808|brushes|rim clicks)\b/i;
const families: [RegExp, string[]][] = [
  [/\b(guitars?|guitarist|lap[- ]steel|slide guitar|twang|feedback|amp[s]?|valve[- ]amp)\b/i, ['gtr_']],
  [/\b(bass|bassline|bassist|sub[- ]bass|low end)\b/i, ['bass_']],
  [/\b(piano|pianos)\b/i, ['piano_', 'rhodes']],
  [/\brhodes\b/i, ['rhodes']],
  [/\b(organ|hammond|rotary)\b/i, ['organ_hammond']],
  [/\b(cello)\b/i, ['cello']],
  [/\b(strings|string quartet|bowed)\b/i, ['strings_section', 'cello', 'mellotron']],
  [/\b(mellotron)\b/i, ['mellotron']],
  [/\b(synths?|synthesizer|oscillators?|sequencer|sequences|pads?)\b/i, ['synth_', 'bass_synth']],
  [/\b(horns?|brass|trumpet)\b/i, ['horns', 'trumpet']],
  [/\b(clavinet)\b/i, ['clavinet']],
  [/\b(harpsichord)\b/i, ['harpsichord']],
  [/\b(vibraphone)\b/i, ['vibraphone']],
  [/\b(music[- ]box|glockenspiel)\b/i, ['glock']],
  [/\b(turntable|scratches|scratched)\b/i, ['turntable']],
];

export function incompatible(text: string, s: Settings, instruments = true): string | null {
  if (s.drums === 'none' && PERCUSSION.test(text)) return 'Sans batterie ni percussions rythmiques';
  if (s.drums !== 'none' && s.sliders.placement > 70 && /behind the beat|lazy swing|heavy swing|deep swing|laid-back/i.test(text)) return 'Placement incompatible avec le calage machine choisi';
  if (instruments) for (const [words, ids] of families) {
    if (words.test(text) && !s.instruments.some(id => ids.some(prefix => id.startsWith(prefix)))) {
      return `Instrument absent de la sélection : ${text.match(words)![0]}`;
    }
  }
  return null;
}

export function compatibleSignature(id: string, s: Settings): boolean {
  return id === 'drum_pattern' ? s.drums !== 'none'
    : id === 'bassline' ? s.instruments.some(i => i.startsWith('bass_'))
    : id === 'riff' ? s.instruments.some(i => i.startsWith('gtr_')) : true;
}

export function reconcile(s: Settings, lex: Lexicon): string[] {
  const notes: string[] = [];
  if (s.drums === 'none' && s.instruments.includes('percussion')) {
    s.instruments = s.instruments.filter(i => i !== 'percussion');
    notes.push('Percussions rythmiques écartées : le choix Sans batterie est prioritaire.');
  }
  if (!compatibleSignature(s.signature, s)) {
    const old = lex.signatures.find(x => x.id === s.signature)?.label ?? s.signature;
    s.signature = 'loop';
    notes.push(`Signature « ${old} » remplacée par Boucle : sa source sonore n’est pas sélectionnée.`);
  }
  return notes;
}
